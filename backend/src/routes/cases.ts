import { Router } from 'express';
import { prisma } from '../prismaClient.js';
import { performAction } from '../domain/performAction.js';
import { TRANSITIONS, type ApprovalAction } from '../domain/workflow.js';

export const casesRouter = Router();

/**
 * One endpoint drives every workflow action (submit/review_pass/review_reject/approve/reject/
 * reopen/complete/cancel) — see backend/src/domain/workflow.ts for the transition table that
 * decides what's allowed from where. Example: POST /cases/<id>/submit { "comment": "..." }
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
      include: { approvals: { orderBy: { actedAt: 'asc' } }, vendor: true, members: true, lineItems: true },
    });
    if (!kase) return res.status(404).json({ error: 'ไม่พบเรื่องนี้' });
    res.json(kase);
  } catch (err) {
    next(err);
  }
});
