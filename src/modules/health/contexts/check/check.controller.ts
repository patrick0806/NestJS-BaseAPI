import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { API_TAGS } from '@shared/constants';
import { Public } from '@shared/decorators';

import { CheckService } from './check.service';
import { HealthCheckResponseDTO } from './dtos/response.dto';

@Public()
@ApiTags(API_TAGS.HEALTH)
@Controller({ version: '1' })
export class CheckController {
  constructor(private checkService: CheckService) {}

  @ApiOperation({
    summary: 'Service health check',
    description:
      'Returns the liveness/readiness state of the service and its dependencies. ' +
      'Currently pings the database via Drizzle (`select 1`). ' +
      'Returns 200 when every indicator is up and 503 when at least one is down. ' +
      'Useful for liveness/readiness probes, uptime monitors, and load-balancer health checks.',
  })
  @ApiOkResponse({
    description: 'Service is healthy — every indicator is up.',
    type: HealthCheckResponseDTO,
  })
  @ApiServiceUnavailableResponse({
    description:
      'Service is unhealthy — at least one indicator is down. The `details` object reports which one.',
    type: HealthCheckResponseDTO,
  })
  @Get()
  handle() {
    return this.checkService.execute();
  }
}
