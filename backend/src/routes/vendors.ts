import { Router } from 'express';
import { prisma } from '../prismaClient.js';
import { ForbiddenError, ValidationError } from '../domain/errors.js';

export const vendorsRouter = Router();

vendorsRouter.get('/vendors', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const vendors = await prisma.vendor.findMany({
      where: search
        ? { OR: [{ legalName: { contains: search, mode: 'insensitive' } }, { taxId: { contains: search } }] }
        : undefined,
      orderBy: { legalName: 'asc' },
      take: 50,
    });
    res.json(vendors);
  } catch (err) {
    next(err);
  }
});

vendorsRouter.post('/vendors', async (req, res, next) => {
  try {
    if (!req.user.roles.includes('procurement_officer') && !req.user.roles.includes('admin')) {
      throw new ForbiddenError('ต้องมีสิทธิ์ เจ้าหน้าที่พัสดุ หรือ ผู้ดูแลระบบ เท่านั้น');
    }
    const { legalName, taxId, contactName, phone, address } = req.body ?? {};
    if (!legalName?.trim()) throw new ValidationError('ต้องระบุชื่อผู้ขาย/ผู้รับจ้าง');
    if (!/^\d{13}$/.test(taxId ?? '')) throw new ValidationError('เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก');

    const owner = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    // upsert by tax_id: reusing an existing vendor is the point — avoid duplicate rows for the
    // same legal entity when different officers type the same tax id on different cases
    const vendor = await prisma.vendor.upsert({
      where: { taxId },
      update: { legalName, contactName, phone, address },
      create: { orgId: owner.orgId, legalName, taxId, contactName, phone, address },
    });
    res.status(201).json(vendor);
  } catch (err) {
    next(err);
  }
});
