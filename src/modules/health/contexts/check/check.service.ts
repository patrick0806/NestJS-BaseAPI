import { Injectable } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Injectable()
export class CheckService {
  constructor(private healthCheckService: HealthCheckService) {}

  @HealthCheck()
  execute() {
    return this.healthCheckService.check([]);
  }
}
