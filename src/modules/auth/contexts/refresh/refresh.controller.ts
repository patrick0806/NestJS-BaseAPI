import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { API_TAGS } from '@shared/constants';
import { Public } from '@shared/decorators';

import { RefreshService } from './refresh.service';
import { RefreshRequestDto, RefreshResponseDto } from './schemas/refresh.schema';

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: '1', path: 'refresh' })
export class RefreshController {
  constructor(private readonly refreshService: RefreshService) {}

  @ApiOperation({
    summary: 'Rotate a refresh token',
    description:
      'Exchanges a valid refresh token for a new JWT access token and a new refresh token. ' +
      'The presented refresh token is revoked on success and cannot be used again. ' +
      '**Reuse detection**: if a revoked refresh token is presented, every active refresh token for the same user is revoked and the request is rejected with 401. ' +
      'This protects the user when a refresh token has been stolen and used out of order. ' +
      'On normal use, call this endpoint before the access token expires and replace both tokens client-side. ' +
      'This endpoint is rate-limited at the proxy layer in production.',
  })
  @ApiBody({
    type: RefreshRequestDto,
    description: 'Payload containing the refresh token to rotate.',
  })
  @ZodResponse({
    status: 200,
    description:
      'Refresh successful. The response contains a fresh access token and a fresh refresh token. The previous refresh token is now revoked.',
    type: RefreshResponseDto,
  })
  @Post()
  async handle(@Body() data: RefreshRequestDto) {
    return await this.refreshService.execute(data);
  }
}
