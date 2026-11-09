import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFactorService } from './two-factor.service';
import { SessionsService } from './sessions.service';
import { MailClient } from './mail.client';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';
import { SecurityMailService } from './security-mail.service';
import { ReauthenticationService } from './reauthentication.service';
import { EmailChangeService } from './email-change.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: (configService.get<string>('jwt.accessTtl') ||
            '15m') as JwtSignOptions['expiresIn'],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionsService,
    TwoFactorService,
    JwtStrategy,
    MailClient,
    EmailVerificationService,
    PasswordResetService,
    SecurityMailService,
    ReauthenticationService,
    EmailChangeService,
  ],
  exports: [
    AuthService,
    TwoFactorService,
    JwtModule,
    PassportModule,
    MailClient,
    SecurityMailService,
    ReauthenticationService,
  ],
})
export class AuthModule {}
