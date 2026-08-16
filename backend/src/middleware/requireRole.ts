import type { NextFunction, Request, Response } from 'express';
import type { RoleCode } from '../domain/workflow.js';

/** Gate a route to specific roles, on top of requireAuth having already set req.user. */
export function requireRole(...allowed: RoleCode[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowed.some((role) => req.user.roles.includes(role))) {
      return res.status(403).json({ error: `ต้องมีสิทธิ์ ${allowed.join(' หรือ ')} เท่านั้น` });
    }
    next();
  };
}
