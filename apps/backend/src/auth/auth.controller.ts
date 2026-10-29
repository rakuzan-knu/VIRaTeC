import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { SessionsService } from './sessions.service';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TwoFactorCodeDto } from './dto/two-factor-code.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Client, type ClientContext } from '../common/decorators/client-context.decorator';
import {
  clearMfaCookie,
  clearSessionCookies,
  cookieNames,
  issueCsrfCookie,
  readCookie,
  setMfaCookie,
  setSessionCookies,
  type SessionTokens,
} from './session-cookies';

type SignInResult<T> = (T & SessionTokens) | { mfaRequired: true; challengeToken: string };

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
    private sessionsService: SessionsService,
    private configService: ConfigService,
    private emailVerification: EmailVerificationService,
    private passwordReset: PasswordResetService,
  ) {}

  private get secure() {
    return this.configService.get<boolean>('security.cookieSecure') ?? false;
  }

  private startSession<T extends object>(
    reply: FastifyReply,
    { accessToken, refreshToken, ...rest }: T & SessionTokens,
  ) {
    setSessionCookies(reply, { accessToken, refreshToken }, this.secure);
    issueCsrfCookie(reply, this.secure);
    return rest;
  }

  private respondToSignIn<T extends object>(reply: FastifyReply, result: SignInResult<T>) {
    if ('mfaRequired' in result) {
      setMfaCookie(reply, result.challengeToken, this.secure);
      return { mfaRequired: true as const };
    }
    clearMfaCookie(reply, this.secure);
    return this.startSession(reply, result);
  }

  @Get('csrf')
  @ApiOperation({ summary: 'Issue the CSRF cookie used by state-changing requests' })
  csrf(@Res({ passthrough: true }) reply: FastifyReply) {
    issueCsrfCookie(reply, this.secure);
    return { success: true };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a student or partner account' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 403, description: 'Privileged roles require administrative provisioning' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() dto: RegisterDto,
    @Client() client: ClientContext,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.startSession(reply, await this.authService.register(dto, client));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, description: 'Authenticated, or a second factor is required' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many attempts' })
  async login(
    @Body() dto: LoginDto,
    @Client() client: ClientContext,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.respondToSignIn(reply, await this.authService.login(dto, client));
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in or register with a Google ID token' })
  @ApiResponse({ status: 200, description: 'Authenticated, or a second factor is required' })
  @ApiResponse({ status: 401, description: 'Invalid Google credential' })
  async google(
    @Body() dto: GoogleAuthDto,
    @Client() client: ClientContext,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.respondToSignIn(reply, await this.authService.googleAuth(dto, client));
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete sign-in with an authenticator or backup code' })
  @ApiResponse({ status: 401, description: 'Invalid code or expired sign-in attempt' })
  async verifySecondFactor(
    @Body() dto: TwoFactorCodeDto,
    @Client() client: ClientContext,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const challenge = readCookie(request, cookieNames(this.secure).mfa);
    if (!challenge) {
      throw new UnauthorizedException('The sign-in attempt has expired. Sign in again.');
    }
    const result = await this.authService.verifyMfaChallenge(challenge, dto.code, client);
    clearMfaCookie(reply, this.secure);
    return this.startSession(reply, result);
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm the account email with the token from the verification link' })
  @ApiResponse({ status: 400, description: 'The link is invalid, used or expired' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Client() client: ClientContext) {
    return this.emailVerification.verify(dto.token, client);
  }

  @Post('email/resend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a new verification link to the account email' })
  @ApiResponse({ status: 429, description: 'Too many verification emails' })
  @ApiResponse({ status: 503, description: 'Email delivery is unavailable' })
  async resendVerification(@CurrentUser('id') userId: string) {
    return this.emailVerification.resend(userId);
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Email a password reset code; the response is the same whether or not the account exists',
  })
  @ApiResponse({ status: 429, description: 'Too many reset requests' })
  @ApiResponse({ status: 503, description: 'Email delivery is unavailable' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Client() client: ClientContext) {
    return this.passwordReset.request(dto.email, client);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password with the emailed code and sign out every device' })
  @ApiResponse({ status: 400, description: 'The code is incorrect or expired' })
  @ApiResponse({ status: 429, description: 'Too many attempts' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Client() client: ClientContext) {
    return this.passwordReset.reset(dto, client);
  }

  @Post('google/link')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect a Google account to the current user' })
  @ApiResponse({ status: 200, description: 'Google account connected' })
  @ApiResponse({ status: 400, description: 'Invalid Google credential' })
  @ApiResponse({ status: 409, description: 'Google account already connected elsewhere' })
  async linkGoogle(@CurrentUser('id') userId: string, @Body() dto: GoogleAuthDto) {
    return this.authService.linkGoogle(userId, dto);
  }

  @Delete('google/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect Google from the current user' })
  @ApiResponse({ status: 200, description: 'Google account disconnected' })
  @ApiResponse({ status: 400, description: 'A password is required to keep a sign-in method' })
  async unlinkGoogle(@CurrentUser('id') userId: string) {
    return this.authService.unlinkGoogle(userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the session using the refresh cookie' })
  async refresh(
    @Client() client: ClientContext,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const refreshToken = readCookie(request, cookieNames(this.secure).refresh);
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    try {
      return this.startSession(reply, await this.authService.refreshToken(refreshToken, client));
    } catch (error) {
      clearSessionCookies(reply, this.secure);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the session of the current device' })
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const refreshToken = readCookie(request, cookieNames(this.secure).refresh);
    clearSessionCookies(reply, this.secure);
    if (!refreshToken) return { success: true };
    return this.sessionsService.logout(refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke every session of the current user' })
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    clearSessionCookies(reply, this.secure);
    return this.sessionsService.logoutAll(userId);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change or set the password and sign out other devices' })
  @ApiResponse({ status: 403, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @CurrentUser('sessionId') sessionId: string | undefined,
    @Body() dto: ChangePasswordDto,
    @Client() client: ClientContext,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.startSession(
      reply,
      await this.authService.changePassword(userId, dto, client, sessionId),
    );
  }

  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start two-factor setup and get the QR code' })
  async beginTwoFactorSetup(@CurrentUser('id') userId: string) {
    return this.twoFactorService.beginSetup(userId);
  }

  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm the first code, enable 2FA and receive backup codes once' })
  async enableTwoFactor(
    @CurrentUser('id') userId: string,
    @CurrentUser('sessionId') sessionId: string | undefined,
    @Body() dto: TwoFactorCodeDto,
    @Client() client: ClientContext,
  ) {
    return this.twoFactorService.enable(userId, dto.code, sessionId, client);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable two-factor authentication (not allowed for administrators)' })
  async disableTwoFactor(
    @CurrentUser('id') userId: string,
    @Body() dto: TwoFactorCodeDto,
    @Client() client: ClientContext,
  ) {
    return this.twoFactorService.disable(userId, dto.code, client);
  }

  @Post('2fa/backup-codes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace backup codes; the new codes are shown once' })
  async regenerateBackupCodes(
    @CurrentUser('id') userId: string,
    @Body() dto: TwoFactorCodeDto,
    @Client() client: ClientContext,
  ) {
    return this.twoFactorService.regenerateBackupCodes(userId, dto.code, client);
  }

  @Post('step-up')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Re-confirm identity for sensitive actions for five minutes' })
  async stepUp(
    @CurrentUser('id') userId: string,
    @CurrentUser('sessionId') sessionId: string | undefined,
    @Body() dto: TwoFactorCodeDto,
    @Client() client: ClientContext,
  ) {
    return this.twoFactorService.stepUp(userId, sessionId, dto.code, client);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions of the current user' })
  async sessions(
    @CurrentUser('id') userId: string,
    @CurrentUser('sessionId') sessionId: string | undefined,
  ) {
    return this.sessionsService.listSessions(userId, sessionId);
  }

  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sign out every other device and erase their session history (IP, browser)',
  })
  async eraseOtherSessions(
    @CurrentUser('id') userId: string,
    @CurrentUser('sessionId') sessionId: string | undefined,
  ) {
    return this.sessionsService.eraseOtherSessions(userId, sessionId);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out a session of the current user' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    return this.sessionsService.revokeSession(userId, sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getAccount(userId);
  }
}
