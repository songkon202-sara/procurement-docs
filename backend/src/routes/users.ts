import { Router } from 'express';
import { prisma } from '../prismaClient.js';
import { requireRole } from '../middleware/requireRole.js';
import { hashPassword } from '../domain/auth.js';
import { ValidationError } from '../domain/errors.js';

export const usersRouter = Router();

/**
 * Account provisioning is admin-only — no self-registration for an internal government tool.
 * The very first admin account has no admin to provision it, so that one is created by
 * prisma/seed.ts instead (see backend/README.md).
 */
usersRouter.post('/users', requireRole('admin'), async (req, res, next) => {
  try {
    const { fullName, position, email, password, roleCodes } = req.body ?? {};
    if (!fullName?.trim()) throw new ValidationError('ต้องระบุชื่อ-นามสกุล');
    if (!position?.trim()) throw new ValidationError('ต้องระบุตำแหน่ง');
    if (!email?.trim()) throw new ValidationError('ต้องระบุอีเมล');
    if (typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    }
    if (!Array.isArray(roleCodes) || roleCodes.length === 0) {
      throw new ValidationError('ต้องกำหนดอย่างน้อย 1 สิทธิ์การใช้งาน');
    }

    const actor = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    const roles = await prisma.role.findMany({ where: { code: { in: roleCodes } } });
    if (roles.length !== roleCodes.length) throw new ValidationError('มีสิทธิ์การใช้งานที่ไม่รู้จักในรายการ');

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        orgId: actor.orgId,
        fullName,
        position,
        email,
        passwordHash,
        roles: { create: roles.map((r) => ({ roleId: r.id, grantedBy: actor.id })) },
      },
      select: { id: true, fullName: true, position: true, email: true, isActive: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});
