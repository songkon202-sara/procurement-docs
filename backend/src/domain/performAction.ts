import type { Prisma, PrismaClient } from '@prisma/client';
import { TRANSITIONS, type ApprovalAction, type CaseStatus, type RoleCode } from './workflow.js';
import { validateCase } from './validation.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from './errors.js';

export interface AuthedUser {
  id: string;
  roles: RoleCode[];
}

interface PerformActionParams {
  caseId: string;
  action: ApprovalAction;
  actor: AuthedUser;
  comment?: string;
}

/**
 * The one function every workflow route calls. Reads the transition rule for `action` out of
 * TRANSITIONS and enforces it — current status, role, ownership, required comment, and business
 * validation — inside a single transaction that also writes the case_approvals and audit_log
 * rows. Adding a new action means adding an entry to TRANSITIONS, not a new handler here.
 */
export async function performAction(prisma: PrismaClient, params: PerformActionParams) {
  const rule = TRANSITIONS[params.action];

  return prisma.$transaction(async (tx) => {
    const kase = await tx.procurementCase.findUnique({ where: { id: params.caseId } });
    if (!kase) throw new NotFoundError('ไม่พบเรื่องนี้');

    if (!rule.from.includes(kase.status as CaseStatus)) {
      throw new ConflictError(`ไม่สามารถทำ "${params.action}" จากสถานะ "${kase.status}" ได้`);
    }
    if (!rule.allowedRoles.some((r: RoleCode) => params.actor.roles.includes(r))) {
      throw new ForbiddenError(`ต้องมีสิทธิ์ ${rule.allowedRoles.join(' หรือ ')} เท่านั้น`);
    }
    if (rule.requireOwner && kase.ownerId !== params.actor.id) {
      throw new ForbiddenError('เฉพาะเจ้าของเรื่องเท่านั้นที่ทำรายการนี้ได้');
    }
    if (rule.requireComment && !params.comment?.trim()) {
      throw new ValidationError('ต้องระบุเหตุผลประกอบการดำเนินการนี้');
    }

    let comment = params.comment ?? null;
    if (rule.requireValidation) {
      const { errors, warnings } = validateCase({
        projectName: kase.projectName,
        method: kase.method,
        legalRef: kase.legalRef,
        amount: Number(kase.amount),
        vendorId: kase.vendorId,
        thresholdOverrideReason: kase.thresholdOverrideReason,
        formData: kase.formData as { orderSubtotal?: string; orderVat?: string },
      });
      if (errors.length > 0) {
        throw new ValidationError('ข้อมูลไม่ผ่านการตรวจสอบ ส่งเรื่องไม่ได้', errors);
      }
      if (warnings.length > 0) {
        comment = [comment, `[คำเตือนที่รับทราบ] ${warnings.join('; ')}`].filter(Boolean).join('\n');
      }
    }

    const updated = await tx.procurementCase.update({
      where: { id: params.caseId },
      data: { status: rule.to },
    });

    await tx.caseApproval.create({
      data: { caseId: params.caseId, actorId: params.actor.id, action: params.action, comment },
    });

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

    return updated;
  });
}
