import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { API_TAGS } from '@shared/constants';
import { Public } from '@shared/decorators';

import { LogoutService } from './logout.service';
import { LogoutRequestDto, LogoutResponseDto } from './schemas/logout.schema';

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: '1', path: 'logout' })
export class LogoutController {
  constructor(private readonly logoutService: LogoutService) {}

  @ApiOperation({
    summary: 'Revoke a refresh token',
    description:
      'Revokes the supplied refresh token so it can no longer be used to obtain a new access token. ' +
      'The endpoint is **idempotent**: it returns 200 whether the token is valid, already revoked, or unknown. ' +
      'This avoids leaking whether a token ever existed. ' +
      'To fully sign out a user from every device, revoke the refresh token issued at login; subsequent requests with that token will fail with 401. ' +
      'Access tokens already issued will remain valid until they expire (default 15m).',
  })
  @ApiBody({
    type: LogoutRequestDto,
    description: 'Payload containing the refresh token to revoke.',
  })
  @ZodResponse({
    status: 200,
    description:
      'Logout processed. The response is always `{ revoked: true }` regardless of whether the token was valid.',
    type: LogoutResponseDto,
  })
  @Post()
  async handle(@Body() data: LogoutRequestDto) {
    return await this.logoutService.execute(data);
  }
}
