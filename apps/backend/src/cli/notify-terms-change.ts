import { NestFactory } from '@nestjs/core';
import { TERMS_VERSION } from '@viratec/contracts';
import { AppModule } from '../app.module';
import { MailClient } from '../auth/mail.client';
import { PrismaService } from '../prisma/prisma.service';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SEND_DELAY_MS = 250;

const noticeMessage = (effectiveDate: string) => ({
  subject: 'Зміни в умовах · Changes to our terms — VIRaTeC',
  text: [
    `З ${effectiveDate} набирає чинності нова редакція (${TERMS_VERSION}) Умов використання та Політики конфіденційності VIRaTeC.`,
    'Під час наступного входу ми попросимо вас прийняти їх. Ознайомитися можна на сайті в розділах «Умови використання» та «Політика конфіденційності».',
    'Запитання: coil.knu@gmail.com.',
    '',
    '---',
    '',
    `A new version (${TERMS_VERSION}) of the VIRaTeC Terms of Service and Privacy Policy takes effect on ${effectiveDate}.`,
    'We will ask you to accept it the next time you sign in. You can read both documents on the website.',
    'Questions: coil.knu@gmail.com.',
  ].join('\n'),
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const [effectiveDate, flag] = process.argv.slice(2);
  if (!effectiveDate || !DATE_PATTERN.test(effectiveDate) || (flag && flag !== '--send')) {
    console.error('Usage: pnpm --filter @viratec/backend terms:notify <YYYY-MM-DD> [--send]');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const recipients = await app.get(PrismaService).user.findMany({
      where: { isBlocked: false, emailVerifiedAt: { not: null } },
      select: { email: true },
      orderBy: { createdAt: 'asc' },
    });
    if (flag !== '--send') {
      console.log(`Dry run: ${recipients.length} recipients. Pass --send to deliver.`);
      return;
    }

    const mail = app.get(MailClient);
    const message = noticeMessage(effectiveDate);
    let failed = 0;
    for (const { email } of recipients) {
      await mail.send({ to: email, ...message }).catch(() => {
        failed += 1;
      });
      await wait(SEND_DELAY_MS);
    }
    console.log(`Sent ${recipients.length - failed}, failed ${failed}.`);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
