import { Injectable, Logger } from '@nestjs/common';
import { MailClient } from './mail.client';

const bilingual = (uk: string[], en: string[]) => [...uk, '', '---', '', ...en].join('\n');

const SUPPORT_UK = 'Якщо це були не ви, негайно змініть пароль і напишіть нам: coil.knu@gmail.com.';
const SUPPORT_EN =
  'If this was not you, change your password immediately and write to coil.knu@gmail.com.';

@Injectable()
export class SecurityMailService {
  private readonly logger = new Logger(SecurityMailService.name);

  constructor(private mail: MailClient) {}

  private async deliver(to: string, subject: string, text: string) {
    try {
      await this.mail.send({ to, subject, text });
    } catch (error) {
      this.logger.warn(`Security email "${subject}" was not sent: ${String(error)}`);
    }
  }

  newDevice(to: string, device: string) {
    return this.deliver(
      to,
      'Новий вхід в обліковий запис · New sign-in — VIRaTeC',
      bilingual(
        ['В обліковий запис VIRaTeC увійшли з нового пристрою:', device, '', SUPPORT_UK],
        ['Your VIRaTeC account was signed in to from a new device:', device, '', SUPPORT_EN],
      ),
    );
  }

  passwordChanged(to: string) {
    return this.deliver(
      to,
      'Пароль змінено · Password changed — VIRaTeC',
      bilingual(
        ['Пароль вашого облікового запису VIRaTeC змінено.', '', SUPPORT_UK],
        ['The password of your VIRaTeC account was changed.', '', SUPPORT_EN],
      ),
    );
  }

  twoFactorDisabled(to: string) {
    return this.deliver(
      to,
      'Двоетапну перевірку вимкнено · Two-step verification turned off — VIRaTeC',
      bilingual(
        ['Для вашого облікового запису VIRaTeC вимкнено двоетапну перевірку.', '', SUPPORT_UK],
        ['Two-step verification was turned off for your VIRaTeC account.', '', SUPPORT_EN],
      ),
    );
  }

  emailChangeRequested(to: string, newEmail: string) {
    return this.deliver(
      to,
      'Запит на зміну пошти · Email change requested — VIRaTeC',
      bilingual(
        [
          `Надійшов запит змінити пошту облікового запису VIRaTeC на ${newEmail}.`,
          'Адреса зміниться лише після підтвердження за посиланням, надісланим на нову пошту.',
          '',
          SUPPORT_UK,
        ],
        [
          `A request was made to change your VIRaTeC account email to ${newEmail}.`,
          'The address changes only after the link sent to the new email is confirmed.',
          '',
          SUPPORT_EN,
        ],
      ),
    );
  }

  emailChanged(to: string, newEmail: string) {
    return this.deliver(
      to,
      'Пошту змінено · Email changed — VIRaTeC',
      bilingual(
        [`Пошту вашого облікового запису VIRaTeC змінено на ${newEmail}.`, '', SUPPORT_UK],
        [`Your VIRaTeC account email was changed to ${newEmail}.`, '', SUPPORT_EN],
      ),
    );
  }

  accountDeleted(to: string) {
    return this.deliver(
      to,
      'Обліковий запис видалено · Account deleted — VIRaTeC',
      bilingual(
        ['Ваш обліковий запис VIRaTeC і пов’язані з ним дані видалено.', '', SUPPORT_UK],
        ['Your VIRaTeC account and the data linked to it have been deleted.', '', SUPPORT_EN],
      ),
    );
  }
}
