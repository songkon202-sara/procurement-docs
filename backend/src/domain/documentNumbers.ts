import { Prisma, type PrismaClient } from '@prisma/client';
import type { AuthedUser } from './performAction.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from './errors.js';

/** Mirrors src/lib/docs.ts's METERED_DOCS — the 7 documents that carry a real เลขที่/วันที่. */
const METERED_DOC_IDS = new Set([
  'approveReq',
  'memo',
  'priceReport',
  'report',
  'approve',
  'inspectReport',
  'payReq',
]);

/**
 * Thai government fiscal year (ปีงบประมาณ): Oct 1 - Sep 30, numbered by the Buddhist-era year
 * it ends in. E.g. Oct 2025 - Sep 2026 (Gregorian) is fiscal year 2569 BE.
 */
export function thaiFiscalYear(d: Date): number {
  const gregorianFiscalYear = d.getUTCMonth() >= 9 ? d.getUTCFullYear() + 1 : d.getUTCFullYear();
  return gregorianFiscalYear + 543;
}

const MAX_ATTEMPTS = 5;

/**
 * Atomically reserves the next running number for the org+fiscal-year and stamps it onto one
 * metered document of one case. Uses optimistic retry on the unique (org_id, fiscal_year,
 * running_no) constraint rather than a row lock — real-world concurrency here is one or two
 * officers per organization, so a handful of retries is far simpler than SELECT ... FOR UPDATE
 * and just as correct.
 */
export async function issueDocumentNumber(
  prisma: PrismaClient,
  params: { caseId: string; docId: string; actor: AuthedUser },
) {
  if (!METERED_DOC_IDS.has(params.docId)) {
    throw new ValidationError('docId ไม่ถูกต้อง — ต้องเป็นหนึ่งในเอกสารที่มีเลขที่หนังสือราชการเท่านั้น');
  }
  if (!params.actor.roles.includes('procurement_officer')) {
    throw new ForbiddenError('ต้องมีสิทธิ์ เจ้าหน้าที่พัสดุ เท่านั้น');
  }

  const kase = await prisma.procurementCase.findUnique({ where: { id: params.caseId } });
  if (!kase) throw new NotFoundError('ไม่พบเรื่องนี้');
  if (kase.ownerId !== params.actor.id) throw new ForbiddenError('เฉพาะเจ้าของเรื่องเท่านั้นที่ขอเลขที่ได้');
  if (kase.status !== 'draft') throw new ConflictError('ขอเลขที่หนังสือได้เฉพาะเรื่องที่ยังเป็นสถานะร่าง (draft) เท่านั้น');

  const existing = await prisma.documentNumber.findUnique({
    where: { caseId_docId: { caseId: params.caseId, docId: params.docId } },
  });
  if (existing) throw new ConflictError('เอกสารฉบับนี้ถูกออกเลขที่ไปแล้ว');

  const org = await prisma.organization.findUniqueOrThrow({ where: { id: kase.orgId } });
  const now = new Date();
  const fiscalYear = thaiFiscalYear(now);
  const docDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const last = await prisma.documentNumber.findFirst({
      where: { orgId: kase.orgId, fiscalYear },
      orderBy: { runningNo: 'desc' },
    });
    const runningNo = (last?.runningNo ?? 0) + 1;
    const docNo = org.docNoPrefix ? `${org.docNoPrefix}/${runningNo}` : String(runningNo);

    try {
      return await prisma.$transaction(async (tx) => {
        const created = await tx.documentNumber.create({
          data: { orgId: kase.orgId, caseId: params.caseId, docId: params.docId, runningNo, docNo, docDate, fiscalYear },
        });

        await tx.auditLog.create({
          data: {
            actorId: params.actor.id,
            entityType: 'document_number',
            entityId: created.id,
            action: 'issue',
            afterData: created as unknown as Prisma.InputJsonValue,
          },
        });

        return created;
      });
    } catch (err) {
      const isUniqueConflict = err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
      if (!isUniqueConflict || attempt === MAX_ATTEMPTS - 1) throw err;
    }
  }
  throw new ConflictError('ออกเลขที่หนังสือไม่สำเร็จ กรุณาลองใหม่');
}
