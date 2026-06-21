import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { API_TAGS } from '@shared/constants';
import { Public } from '@shared/decorators';

import { LoginService } from './login.service';
import { LoginRequestDto, TokenResponseDto } from './schemas/login.schema';

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: '1', path: 'login' })
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @ApiOperation({
    summary: 'Authenticate a user',
    description:
      "Validates the supplied credentials against the `users` table and returns a signed JWT access token plus a single-use refresh token. " +
      'Send the access token in the `Authorization: Bearer <token>` header on every protected route. ' +
      'The refresh token is opaque, stored as a SHA-256 hash server-side, and is valid for `' +
      'REFRESH_TOKEN_EXPIRATION' +
      '` (default 7d). ' +
      'When the access token expires, exchange the refresh token for a new pair via `POST /api/v1/auth/refresh`. ' +
      'Refresh tokens are **single-use with reuse detection**: presenting an already-revoked refresh token will revoke every active session for the user. ' +
      'Call `POST /api/v1/auth/logout` to revoke the current refresh token. ' +
      'This endpoint is rate-limited at the proxy layer in production.',
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'Credentials payload. Both `email` and `password` are required.',
  })
  @ZodResponse({
    status: 200,
    description:
      'Login successful. The response body contains the JWT access token, its lifetime, and a single-use refresh token. Store the refresh token securely — it can only be redeemed once.',
    type: TokenResponseDto,
  })
  @Post()
  async handle(@Body() loginData: LoginRequestDto) {
    return await this.loginService.execute(loginData);
  }
}
