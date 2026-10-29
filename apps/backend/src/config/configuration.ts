import { createHash } from 'node:crypto';

const MIN_SECRET_LENGTH = 32;
const DURATION_UNITS_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 60 * 60_000,
  d: 24 * 60 * 60_000,
};
const isProduction = process.env.NODE_ENV === 'production';

function requireSecret(name: string, devFallback: string) {
  const value = process.env[name];
  if (value && value.length >= MIN_SECRET_LENGTH) return value;
  if (isProduction) {
    throw new Error(
      `${name} must be set to a random value of at least ${MIN_SECRET_LENGTH} characters`,
    );
  }
  return value || devFallback;
}

function parseDurationMs(value: string) {
  const match = /^(\d+)\s*([smhd]?)$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration "${value}". Use a number with s, m, h or d`);
  return Number(match[1]) * (match[2] ? DURATION_UNITS_MS[match[2]] : 1);
}

function resolveEncryptionKey(accessSecret: string) {
  const raw = process.env.TOTP_ENCRYPTION_KEY;
  if (raw) {
    const key = Buffer.from(raw, 'base64');
    if (key.length === 32) return key;
    throw new Error('TOTP_ENCRYPTION_KEY must be 32 bytes encoded in base64');
  }
  if (isProduction) {
    throw new Error('TOTP_ENCRYPTION_KEY must be set in production');
  }
  return createHash('sha256').update(`totp:${accessSecret}`).digest();
}

export default () => {
  const accessSecret = requireSecret(
    'JWT_ACCESS_SECRET',
    'default_jwt_access_secret_for_local_dev',
  );
  const refreshSecret = requireSecret(
    'JWT_REFRESH_SECRET',
    'default_jwt_refresh_secret_for_local_dev',
  );

  const refreshTtl = process.env.JWT_REFRESH_TTL || '7d';

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    corsOrigins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173'],
    jwt: {
      accessSecret,
      accessTtl: process.env.JWT_ACCESS_TTL || '15m',
      refreshSecret,
      refreshTtl,
      refreshTtlMs: parseDurationMs(refreshTtl),
    },
    security: {
      isProduction,
      cookieSecure: isProduction || process.env.COOKIE_SECURE === 'true',
      totpEncryptionKey: resolveEncryptionKey(accessSecret),
      totpIssuer: process.env.TOTP_ISSUER || 'VIRaTeC',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
    },
    mail: {
      from: process.env.MAIL_FROM?.trim() || '',
      frontendUrl: (process.env.FRONTEND_URL?.trim() || 'http://localhost:5173').replace(
        /\/+$/,
        '',
      ),
      gmail: {
        clientId: process.env.GMAIL_CLIENT_ID?.trim() || '',
        clientSecret: process.env.GMAIL_CLIENT_SECRET?.trim() || '',
        refreshToken: process.env.GMAIL_REFRESH_TOKEN?.trim() || '',
      },
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    contentful: {
      spaceId: process.env.CONTENTFUL_SPACE_ID?.trim() || '',
      environment: process.env.CONTENTFUL_ENVIRONMENT?.trim() || 'master',
      deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN?.trim() || '',
      previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN?.trim() || '',
      managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN?.trim() || '',
      webhookSecret: process.env.CONTENTFUL_WEBHOOK_SECRET?.trim() || '',
      locales: {
        en: process.env.CONTENTFUL_LOCALE_EN?.trim() || 'en',
        uk: process.env.CONTENTFUL_LOCALE_UK?.trim() || 'uk',
      },
    },
    s3: {
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
      bucketDocs: process.env.S3_BUCKET_DOCS || 'viratec-docs',
      bucketMedia: process.env.S3_BUCKET_MEDIA || 'viratec-media',
    },
  };
};
