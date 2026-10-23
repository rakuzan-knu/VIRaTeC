import { PrismaClient, StaffRole } from '@prisma/client';
import { MAX_OWNERS } from '../security/staff';

async function main() {
  const [email, flag, replaceEmail] = process.argv.slice(2);
  if (!email || (flag !== undefined && (flag !== '--replace' || !replaceEmail))) {
    console.error(
      'Usage: pnpm --filter @viratec/backend owner:assign <email> [--replace <owner-email>]',
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const target = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!target) throw new Error(`No user with email ${email}. They must register first.`);
    if (target.isBlocked) throw new Error('A suspended user cannot become an owner.');
    if (target.staffRole === StaffRole.OWNER) {
      console.log(`${target.email} is already an owner.`);
      return;
    }

    const owners = await prisma.user.findMany({
      where: { staffRole: StaffRole.OWNER },
      select: { id: true, email: true },
    });
    const replaced = replaceEmail
      ? owners.find((owner) => owner.email === replaceEmail.toLowerCase())
      : undefined;
    if (replaceEmail && !replaced) throw new Error(`${replaceEmail} is not an owner.`);
    if (!replaced && owners.length >= MAX_OWNERS) {
      throw new Error(
        `There are already ${MAX_OWNERS} owners (${owners.map((owner) => owner.email).join(', ')}). ` +
          'Pass --replace <owner-email> to demote one of them to a regular user.',
      );
    }

    await prisma.$transaction([
      ...(replaced
        ? [
            prisma.user.update({
              where: { id: replaced.id },
              data: { staffRole: StaffRole.NONE, permissions: [], staffExpiresAt: null },
            }),
            prisma.refreshToken.updateMany({
              where: { userId: replaced.id, revoked: false },
              data: { revoked: true },
            }),
          ]
        : []),
      prisma.user.update({
        where: { id: target.id },
        data: { staffRole: StaffRole.OWNER, permissions: [], staffExpiresAt: null },
      }),
      prisma.auditLog.create({
        data: {
          action: 'admin.owner_assigned',
          targetType: 'user',
          targetId: target.id,
          metadata: { via: 'cli', replaced: replaced?.id ?? null },
        },
      }),
    ]);

    console.log(`${target.email} is now an owner.`);
    if (!target.twoFactorEnabled) {
      console.log('They must enable two-factor authentication before the admin panel opens.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
