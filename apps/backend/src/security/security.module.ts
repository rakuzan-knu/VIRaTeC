import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RateLimitService } from './rate-limit.service';
import { CleanupService } from './cleanup.service';

@Global()
@Module({
  providers: [AuditService, RateLimitService, CleanupService],
  exports: [AuditService, RateLimitService],
})
export class SecurityModule {}
