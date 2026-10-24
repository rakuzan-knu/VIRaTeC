import { createHash } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import type { FastifyReply, FastifyRequest } from 'fastify';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CSRF_HEADER, cookieNames } from './auth/session-cookies';
import { safeEqual } from './security/crypto';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const isProduction = process.env.NODE_ENV === 'production';

function resolveTrustProxy(value = isProduction ? '1' : 'false'): boolean | number | string {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

async function setEtag(request: FastifyRequest, reply: FastifyReply, payload: unknown) {
  if (request.method !== 'GET' || reply.statusCode !== 200 || typeof payload !== 'string') {
    return payload;
  }
  const etag = `W/"${createHash('sha1').update(payload).digest('base64url')}"`;
  reply.header('ETag', etag);
  if (request.headers['if-none-match'] === etag) {
    reply.code(304);
    return '';
  }
  return payload;
}

interface CsrfRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string | undefined>;
}

interface CsrfReply {
  status(code: number): { send(payload: unknown): unknown };
}

function hasSessionCookie(request: CsrfRequest) {
  return [false, true].some((secure) => {
    const names = cookieNames(secure);
    return [names.access, names.refresh, names.mfa].some((name) => request.cookies?.[name]);
  });
}

function readCsrfCookie(request: CsrfRequest) {
  return request.cookies?.[cookieNames(true).csrf] ?? request.cookies?.[cookieNames(false).csrf];
}

async function verifyCsrf(request: CsrfRequest, reply: CsrfReply) {
  if (!UNSAFE_METHODS.has(request.method) || !request.url.startsWith('/api/')) return;

  const usesBearerOnly =
    typeof request.headers.authorization === 'string' && !hasSessionCookie(request);
  if (usesBearerOnly) return;

  const header = request.headers[CSRF_HEADER];
  const cookieToken = readCsrfCookie(request);
  if (typeof header !== 'string' || !cookieToken || !safeEqual(header, cookieToken)) {
    await reply.status(403).send({
      statusCode: 403,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: { message: 'Invalid or missing CSRF token', code: 'CSRF_INVALID' },
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // delegated to nestjs-pino
      trustProxy: resolveTrustProxy(process.env.TRUST_PROXY),
    }),
    { bufferLogs: true },
  );

  const logger = app.get(Logger);
  app.useLogger(logger);

  // Security & Performance Plugins
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook('onSend', setEtag);
  await app.register(helmet, {
    contentSecurityPolicy: isProduction,
  });
  await app.register(compress, { encodings: ['gzip', 'deflate'] });
  await app.register(cookie);
  fastify.addHook('preValidation', verifyCsrf);

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-CSRF-Token'],
  });

  // Global prefixes and pipes
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger OpenAPI Documentation
  const swaggerEnabled = !isProduction || process.env.SWAGGER_ENABLED === 'true';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('VIRaTeC API')
      .setDescription(
        'Virtual Innovating Research & Technology Community Platform API — Taras Shevchenko National University of Kyiv (FIT + NNIF)',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('vt_at')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableShutdownHooks();

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 VIRaTeC API is running on: http://localhost:${port}/api/v1`);
  if (swaggerEnabled) {
    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/docs`);
  }
}

bootstrap();
