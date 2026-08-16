import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../domain/auth.js';
import type { AuthedUser } from '../domain/performAction.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: AuthedUser;
    }
  }
}

/**
 * Verifies the `Authorization: Bearer <token>` header against JWT_SECRET (see
 * src/domain/auth.ts) and sets req.user from the token's claims. Replaces the earlier
 * dev-only stub that trusted x-user-id/x-user-roles headers as-is — those headers are no
 * longer read anywhere.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) {
    return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ (missing Authorization: Bearer token)' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, roles: payload.roles };
    next();
  } catch {
    res.status(401).json({ error: 'โทเคนไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}
