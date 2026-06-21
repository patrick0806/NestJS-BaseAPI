import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Login' })
  @ZodResponse({
    status: 200,
    description: 'Login successful',
    type: TokenResponseDto,
  })
  @Post()
  async handle(@Body() loginData: LoginRequestDto) {
    return await this.loginService.execute(loginData);
  }
}
