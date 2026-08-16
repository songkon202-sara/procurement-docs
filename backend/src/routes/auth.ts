import { Router } from 'express';
import { prisma } from '../prismaClient.js';
import { signToken, verifyPassword } from '../domain/auth.js';
import { ValidationError } from '../domain/errors.js';
import type { RoleCode } from '../domain/workflow.js';

export const authRouter = Router();

authRouter.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) throw new ValidationError('ต้องระบุอีเมลและรหัสผ่าน');

    // Same 401 for "no such user" and "wrong password" — don't let the response shape
    // reveal which emails are registered.
    const invalidCreds = { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !user.isActive) return res.status(401).json(invalidCreds);

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json(invalidCreds);

    const roles = user.roles.map((r) => r.role.code as RoleCode);
    const token = signToken({ sub: user.id, roles });

    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, position: user.position, email: user.email, roles },
    });
  } catch (err) {
    next(err);
  }
});
