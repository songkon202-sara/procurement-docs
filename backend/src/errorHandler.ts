import type { NextFunction, Request, Response } from 'express';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from './domain/errors.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ValidationError) return res.status(422).json({ error: err.message, details: err.details });
  if (err instanceof ForbiddenError) return res.status(403).json({ error: err.message });
  if (err instanceof ConflictError) return res.status(409).json({ error: err.message });
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });

  console.error(err);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด' });
}
