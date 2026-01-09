import { Module, MiddlewareConsumer, NestModule, Global } from '@nestjs/common';
import { AuditLogService } from './services/audit-log.service';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { HealthController } from './controllers/health.controller';

@Global()
@Module({
  controllers: [HealthController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
