import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { API_TAGS } from '@shared/constants';

import { CheckService } from './check.service';

@ApiTags(API_TAGS.HEALTH)
@Controller({ version: '1' })
export class CheckController {
  constructor(private checkService: CheckService) {}

  @Get()
  handle() {
    return this.checkService.execute();
  }
}
