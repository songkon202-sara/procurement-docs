import type { Category, CaseStatus, PersonRow, ProcurementData } from '../types';
import { createDefaultData } from './defaultData';
import { makeId } from './id';
import { numOf } from './validation';

/** Shape of a case as returned by the backend (backend/src/routes/cases.ts). */
export interface ApiCase {
  id: string;
  orgId: string;
  category: string;
  projectName: string;
  method: string;
  legalRef: string;
  amount: string; // Prisma Decimal serializes as a string
  fundSource: string | null;
  vendorId: string | null;
  status: CaseStatus;
  ownerId: string;
  thresholdOverrideReason: string | null;
  formData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lineItems?: { id: string; name: string; qty: string; unit: string; unitPrice: string }[];
  members?: { id: string; kind: 'committee' | 'inspectors'; userId: string | null; externalName: string | null; position: string; roleLabel: string }[];
}

export interface CasePayload {
  category: Category;
  projectName: string;
  method: string;
  legalRef: string;
  amount: number;
  fundSource?: string;
  vendorId?: string;
  lineItems: { name: string; qty: number; unit: string; unitPrice: number }[];
  members: { kind: 'committee' | 'inspectors'; externalName: string; position: string; roleLabel: string }[];
  formData: Record<string, unknown>;
}

/**
 * Maps the frontend's ProcurementData onto the case shape the backend understands. Only a
 * handful of fields (amount, method, legalRef, vendorId, ...) are real, queryable columns on
 * procurement_cases — everything else in ProcurementData is layout/document-specific and has
 * no reporting/RBAC use, so the whole object also goes into formData verbatim. That makes
 * fromCase() below a lossless round-trip: formData is the full source of truth for the
 * document, and the real columns are just a queryable mirror of a few of those same fields.
 */
export function toCasePayload(data: ProcurementData, category: Category): CasePayload {
  const toMember = (kind: 'committee' | 'inspectors') => (p: PersonRow) => ({
    kind,
    externalName: p.name,
    position: p.pos,
    roleLabel: p.role,
  });

  return {
    category,
    projectName: data.projectName,
    method: data.method,
    legalRef: data.legalRef,
    amount: numOf(data.amount),
    fundSource: data.fundSource || undefined,
    vendorId: data.vendorId || undefined,
    lineItems: data.items.map((it) => ({ name: it.name, qty: numOf(it.qty), unit: it.unit, unitPrice: numOf(it.price) })),
    members: [...data.committee.map(toMember('committee')), ...data.inspectors.map(toMember('inspectors'))],
    formData: data as unknown as Record<string, unknown>,
  };
}

export function fromCase(kase: ApiCase): { category: Category; data: ProcurementData } {
  const saved = (kase.formData ?? {}) as Partial<ProcurementData>;

  const data: ProcurementData = {
    ...createDefaultData(),
    ...saved,
    projectName: kase.projectName,
    method: kase.method,
    legalRef: kase.legalRef,
    amount: kase.amount,
    fundSource: kase.fundSource ?? '',
    vendorId: kase.vendorId ?? '',
    items: (kase.lineItems ?? []).map((it) => ({ id: makeId(), name: it.name, qty: it.qty, unit: it.unit, price: it.unitPrice })),
    committee: (kase.members ?? [])
      .filter((m) => m.kind === 'committee')
      .map((m) => ({ id: makeId(), name: m.externalName ?? '', pos: m.position, role: m.roleLabel })),
    inspectors: (kase.members ?? [])
      .filter((m) => m.kind === 'inspectors')
      .map((m) => ({ id: makeId(), name: m.externalName ?? '', pos: m.position, role: m.roleLabel })),
  };

  return { category: kase.category as Category, data };
}
