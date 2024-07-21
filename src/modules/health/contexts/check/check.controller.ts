import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { API_TAGS } from '@shared/constants';
import { Public } from '@shared/decorators';

import { CheckService } from './check.service';
import { HealthCheckResponseDTO } from './dtos/response.dto';

@Public()
@ApiTags(API_TAGS.HEALTH)
@Controller({ version: '1' })
export class CheckController {
  constructor(private checkService: CheckService) {}

  @ApiOperation({ summary: 'Health Check' })
  @ApiOkResponse({ description: 'Health Check', type: HealthCheckResponseDTO })
  @Get()
  handle() {
    return this.checkService.execute();
  }
}
