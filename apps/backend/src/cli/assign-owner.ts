import { PrismaClient, StaffRole } from '@prisma/client';

async function main() {
  const [email, flag] = process.argv.slice(2);
  if (!email) {
    console.error('Usage: pnpm --filter @viratec/backend owner:assign <email> [--replace]');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const target = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!target) throw new Error(`No user with email ${email}. They must register first.`);
    if (target.isBlocked) throw new Error('A suspended user cannot become the owner.');

    const currentOwner = await prisma.user.findFirst({ where: { staffRole: StaffRole.OWNER } });
    if (currentOwner?.id === target.id) {
      console.log(`${target.email} is already the owner.`);
      return;
    }
    if (currentOwner && flag !== '--replace') {
      throw new Error(
        `${currentOwner.email} is the current owner. Pass --replace to demote them to a regular user.`,
      );
    }

    await prisma.$transaction([
      ...(currentOwner
        ? [
            prisma.user.update({
              where: { id: currentOwner.id },
              data: { staffRole: StaffRole.NONE, permissions: [], staffExpiresAt: null },
            }),
            prisma.refreshToken.updateMany({
              where: { userId: currentOwner.id, revoked: false },
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
          metadata: { via: 'cli', replaced: currentOwner?.id ?? null },
        },
      }),
    ]);

    console.log(`${target.email} is now the owner.`);
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
