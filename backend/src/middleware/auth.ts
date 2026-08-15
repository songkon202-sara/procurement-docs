import type { NextFunction, Request, Response } from 'express';
import type { AuthedUser } from '../domain/performAction.js';
import type { RoleCode } from '../domain/workflow.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: AuthedUser;
    }
  }
}

const VALID_ROLES: readonly RoleCode[] = ['procurement_officer', 'auditor', 'approver', 'admin', 'viewer'];

/**
 * DEV-ONLY STUB. Trusts `x-user-id` / `x-user-roles` headers as-is — there is no login flow,
 * session, or JWT verification yet (out of scope for the workflow-engine work this ports).
 * Replace with real session/JWT auth (verify against users.password_hash, issue a signed
 * session token, look roles up from user_roles) before this ever faces real users.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.header('x-user-id');
  const rolesHeader = req.header('x-user-roles') ?? '';
  const roles = rolesHeader
    .split(',')
    .map((r) => r.trim())
    .filter((r): r is RoleCode => VALID_ROLES.includes(r as RoleCode));

  if (!userId) {
    return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ (missing x-user-id header)' });
  }

  req.user = { id: userId, roles };
  next();
}
