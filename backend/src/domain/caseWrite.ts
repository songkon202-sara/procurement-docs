import type { Prisma, PrismaClient } from '@prisma/client';
import type { AuthedUser } from './performAction.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from './errors.js';

export interface CreateCaseInput {
  category: string;
  projectName: string;
  method: string;
  legalRef: string;
  amount: number;
  fundSource?: string;
  vendorId?: string;
}

export interface UpdateCaseInput {
  projectName?: string;
  method?: string;
  legalRef?: string;
  amount?: number;
  fundSource?: string | null;
  vendorId?: string | null;
  thresholdOverrideReason?: string | null;
  formData?: Record<string, unknown>;
  lineItems?: { name: string; qty: number; unit: string; unitPrice: number }[];
  members?: {
    kind: 'committee' | 'inspectors';
    userId?: string;
    externalName?: string;
    position: string;
    roleLabel: string;
  }[];
}

const CATEGORIES = new Set(['purchase', 'hire', 'construction']);

export async function createCase(prisma: PrismaClient, actor: AuthedUser, input: CreateCaseInput) {
  if (!actor.roles.includes('procurement_officer')) {
    throw new ForbiddenError('ต้องมีสิทธิ์ เจ้าหน้าที่พัสดุ เท่านั้น');
  }
  if (!CATEGORIES.has(input.category)) throw new ValidationError('category ไม่ถูกต้อง');
  if (!input.projectName?.trim()) throw new ValidationError('ต้องระบุชื่อโครงการ');
  if (!input.method?.trim()) throw new ValidationError('ต้องระบุวิธีจัดซื้อจัดจ้าง');
  if (!input.legalRef?.trim()) throw new ValidationError('ต้องระบุมาตราอ้างอิง');
  if (!(input.amount > 0)) throw new ValidationError('วงเงินต้องมากกว่า 0');

  const owner = await prisma.user.findUnique({ where: { id: actor.id } });
  if (!owner) throw new NotFoundError('ไม่พบผู้ใช้งานนี้ในระบบ');

  return prisma.procurementCase.create({
    data: {
      orgId: owner.orgId,
      ownerId: owner.id,
      category: input.category,
      projectName: input.projectName,
      method: input.method,
      legalRef: input.legalRef,
      amount: input.amount,
      fundSource: input.fundSource,
      vendorId: input.vendorId,
    },
  });
}

/**
 * Cases are only editable while status = 'draft' — once submitted, changes must go through the
 * workflow (reopen -> edit -> submit again) so the approval/audit trail always reflects what was
 * actually reviewed. lineItems/members are full-replace: the frontend already edits the whole
 * form as one object (see src/state/store.tsx), so there's no reason to build granular per-item
 * REST endpoints the frontend has no use for.
 */
export async function updateCaseDraft(
  prisma: PrismaClient,
  params: { caseId: string; actor: AuthedUser; patch: UpdateCaseInput },
) {
  return prisma.$transaction(async (tx) => {
    const kase = await tx.procurementCase.findUnique({ where: { id: params.caseId } });
    if (!kase) throw new NotFoundError('ไม่พบเรื่องนี้');
    if (kase.status !== 'draft') {
      throw new ConflictError('แก้ไขได้เฉพาะเรื่องที่ยังเป็นสถานะร่าง (draft) เท่านั้น');
    }
    if (kase.ownerId !== params.actor.id) {
      throw new ForbiddenError('เฉพาะเจ้าของเรื่องเท่านั้นที่แก้ไขได้');
    }

    const { lineItems, members, ...fields } = params.patch;

    const updated = await tx.procurementCase.update({
      where: { id: params.caseId },
      data: fields as Prisma.ProcurementCaseUncheckedUpdateInput,
    });

    if (lineItems) {
      await tx.caseLineItem.deleteMany({ where: { caseId: params.caseId } });
      if (lineItems.length > 0) {
        await tx.caseLineItem.createMany({
          data: lineItems.map((item, i) => ({
            caseId: params.caseId,
            name: item.name,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            sortOrder: i,
          })),
        });
      }
    }

    if (members) {
      await tx.caseMember.deleteMany({ where: { caseId: params.caseId } });
      if (members.length > 0) {
        await tx.caseMember.createMany({
          data: members.map((m, i) => ({
            caseId: params.caseId,
            kind: m.kind,
            userId: m.userId,
            externalName: m.externalName,
            position: m.position,
            roleLabel: m.roleLabel,
            sortOrder: i,
          })),
        });
      }
    }

    await tx.auditLog.create({
      data: {
        actorId: params.actor.id,
        entityType: 'procurement_case',
        entityId: params.caseId,
        action: 'update',
        beforeData: kase as unknown as Prisma.InputJsonValue,
        afterData: updated as unknown as Prisma.InputJsonValue,
      },
    });

    return tx.procurementCase.findUniqueOrThrow({
      where: { id: params.caseId },
      include: { lineItems: true, members: true, vendor: true },
    });
  });
}
