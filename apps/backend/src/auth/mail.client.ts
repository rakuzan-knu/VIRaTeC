import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const REQUEST_TIMEOUT_MS = 10_000;
const UNSAFE_HEADER_PATTERN = /[\r\n]/;

export interface MailConfig {
  from: string;
  frontendUrl: string;
  gmail: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

const encodeHeader = (value: string) =>
  `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;

export function buildMimeMessage(from: string, { to, subject, text }: MailMessage) {
  if ([from, to, subject].some((value) => UNSAFE_HEADER_PATTERN.test(value))) {
    throw new Error('Mail headers must not contain line breaks');
  }
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(text, 'utf8').toString('base64'),
  ].join('\r\n');
}

@Injectable()
export class MailClient {
  private readonly logger = new Logger(MailClient.name);
  private oauth?: OAuth2Client;

  constructor(private readonly configService: ConfigService) {}

  get config(): MailConfig {
    return this.configService.getOrThrow<MailConfig>('mail');
  }

  private get isProduction() {
    return this.configService.get<boolean>('security.isProduction') ?? false;
  }

  isConfigured() {
    const { from, gmail } = this.config;
    return Boolean(from && gmail.clientId && gmail.clientSecret && gmail.refreshToken);
  }

  assertAvailable() {
    if (this.isProduction && !this.isConfigured()) {
      throw new ServiceUnavailableException({
        message: 'Email delivery is not available right now',
        code: 'EMAIL_UNAVAILABLE',
      });
    }
  }

  buildLink(path: string, params: Record<string, string>) {
    const url = new URL(path, `${this.config.frontendUrl}/`);
    url.search = new URLSearchParams(params).toString();
    return url.toString();
  }

  async send(message: MailMessage) {
    this.assertAvailable();
    if (!this.isConfigured()) {
      this.logger.warn(
        `Email is not configured, message for ${message.to} was not sent:\n${message.subject}\n${message.text}`,
      );
      return;
    }

    const raw = Buffer.from(buildMimeMessage(this.config.from, message), 'utf8').toString(
      'base64url',
    );
    let response: Response;
    try {
      const { token } = await this.client().getAccessToken();
      if (!token) throw new Error('Gmail returned no access token');
      response = await fetch(GMAIL_SEND_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error(`Gmail request failed: ${String(error)}`);
      throw this.unavailable();
    }

    if (!response.ok) {
      this.logger.error(
        `Gmail responded with ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );
      throw this.unavailable();
    }
  }

  private client() {
    if (!this.oauth) {
      const { clientId, clientSecret, refreshToken } = this.config.gmail;
      this.oauth = new OAuth2Client({ clientId, clientSecret });
      this.oauth.setCredentials({ refresh_token: refreshToken });
    }
    return this.oauth;
  }

  private unavailable() {
    return new ServiceUnavailableException({
      message: 'The email could not be sent. Try again later.',
      code: 'EMAIL_UNAVAILABLE',
    });
  }
}
