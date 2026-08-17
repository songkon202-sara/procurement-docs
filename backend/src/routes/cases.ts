import { Router } from 'express';
import { prisma } from '../prismaClient.js';
import { performAction } from '../domain/performAction.js';
import { createCase, updateCaseDraft } from '../domain/caseWrite.js';
import { issueDocumentNumber } from '../domain/documentNumbers.js';
import { TRANSITIONS, type ApprovalAction } from '../domain/workflow.js';

export const casesRouter = Router();

casesRouter.get('/cases', async (req, res, next) => {
  try {
    const owner = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const mineOnly = req.query.mine === 'true';
    const cases = await prisma.procurementCase.findMany({
      where: {
        orgId: owner.orgId,
        status,
        ownerId: mineOnly ? owner.id : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(cases);
  } catch (err) {
    next(err);
  }
});

casesRouter.post('/cases', async (req, res, next) => {
  try {
    const created = await createCase(prisma, req.user, req.body ?? {});
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

casesRouter.patch('/cases/:id', async (req, res, next) => {
  try {
    const updated = await updateCaseDraft(prisma, { caseId: req.params.id, actor: req.user, patch: req.body ?? {} });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** Reserves the next org-wide running number for one metered document of this case (see backend/src/domain/documentNumbers.ts). */
casesRouter.post('/cases/:id/document-numbers', async (req, res, next) => {
  try {
    const created = await issueDocumentNumber(prisma, { caseId: req.params.id, docId: req.body?.docId, actor: req.user });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * One endpoint drives every workflow action (submit/review_pass/review_reject/approve/reject/
 * reopen/complete/cancel) — see backend/src/domain/workflow.ts for the transition table that
 * decides what's allowed from where. Example: POST /cases/<id>/submit { "comment": "..." }
 * Registered after the more specific POST routes above so "document-numbers" isn't swallowed
 * as an unknown :action.
 */
casesRouter.post('/cases/:id/:action', async (req, res, next) => {
  try {
    const action = req.params.action as ApprovalAction;
    if (!(action in TRANSITIONS)) {
      return res.status(404).json({ error: `ไม่รู้จัก action "${action}"` });
    }

    const updated = await performAction(prisma, {
      caseId: req.params.id,
      action,
      actor: req.user,
      comment: req.body?.comment,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

casesRouter.get('/cases/:id', async (req, res, next) => {
  try {
    const kase = await prisma.procurementCase.findUnique({
      where: { id: req.params.id },
      include: { approvals: { orderBy: { actedAt: 'asc' } }, vendor: true, members: true, lineItems: true, documentNumbers: true },
    });
    if (!kase) return res.status(404).json({ error: 'ไม่พบเรื่องนี้' });
    res.json(kase);
  } catch (err) {
    next(err);
  }
});
