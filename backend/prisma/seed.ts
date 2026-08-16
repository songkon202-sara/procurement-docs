import { randomBytes } from 'node:crypto';
import { prisma } from '../src/prismaClient.js';
import { hashPassword } from '../src/domain/auth.js';

/**
 * Bootstraps the roles table and one admin account so there's someone able to call the
 * admin-only POST /users route and provision everyone else. Safe to re-run — everything is
 * upserted. Run with: npx prisma db seed (wired via package.json's "prisma.seed").
 */
async function main() {
  const roleDefs = [
    { code: 'procurement_officer', nameTh: 'เจ้าหน้าที่พัสดุ' },
    { code: 'auditor', nameTh: 'ผู้ตรวจสอบ' },
    { code: 'approver', nameTh: 'ผู้มีอำนาจอนุมัติ' },
    { code: 'admin', nameTh: 'ผู้ดูแลระบบ' },
    { code: 'viewer', nameTh: 'ผู้ดูรายงาน (อ่านอย่างเดียว)' },
  ];
  for (const r of roleDefs) {
    await prisma.role.upsert({ where: { code: r.code }, update: { nameTh: r.nameTh }, create: r });
  }

  const org = await prisma.organization.upsert({
    where: { id: process.env.SEED_ORG_ID ?? '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      name: process.env.SEED_ORG_NAME ?? 'หน่วยงานตัวอย่าง',
    },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.go.th';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log(`Admin account already exists: ${adminEmail}`);
    return;
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString('base64url');
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: 'admin' } });

  await prisma.user.create({
    data: {
      orgId: org.id,
      fullName: 'ผู้ดูแลระบบเริ่มต้น',
      position: 'ผู้ดูแลระบบ',
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      roles: { create: [{ roleId: adminRole.id }] },
    },
  });

  console.log('Created bootstrap admin account:');
  console.log(`  email:    ${adminEmail}`);
  console.log(`  password: ${adminPassword}`);
  console.log('Log in once and provision real accounts via POST /users, then treat this one as break-glass only.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
