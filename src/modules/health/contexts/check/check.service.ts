import { Injectable } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { DrizzleHealthIndicator } from '@config/database/health/drizzle.health';

@Injectable()
export class CheckService {
  constructor(
    private healthCheckService: HealthCheckService,
    private drizzleHealth: DrizzleHealthIndicator,
  ) {}

  @HealthCheck()
  execute() {
    return this.healthCheckService.check([async () => this.drizzleHealth.check()]);
  }
}
