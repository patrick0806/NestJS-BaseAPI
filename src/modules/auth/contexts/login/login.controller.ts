import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { API_TAGS } from '@shared/constants';
import { Public } from '@shared/decorators';

import { LoginRequestDto } from './dtos/request.dto';
import { LoginService } from './login.service';
import { TokenResponseDto } from './schemas/login.schema';

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: '1', path: 'login' })
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @ApiOperation({
    summary: 'Authenticate a user',
    description:
      "Validates the supplied credentials against the `users` table and returns a signed JWT. " +
      'Send the returned token in the `Authorization: Bearer <token>` header on every protected route. ' +
      'This endpoint is rate-limited at the proxy layer in production.',
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'Credentials payload. Both `email` and `password` are required.',
  })
  @ZodResponse({
    status: 200,
    description:
      'Login successful. The response body contains the JWT access token and its lifetime.',
    type: TokenResponseDto,
  })
  @Post()
  async handle(@Body() loginData: LoginRequestDto) {
    return await this.loginService.execute(loginData);
  }
}
