import { PickType } from '@nestjs/swagger';
import { ResetPasswordDto } from './reset-password.dto';

export class VerifyResetCodeDto extends PickType(ResetPasswordDto, ['email', 'code'] as const) {}
