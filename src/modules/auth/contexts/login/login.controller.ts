import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { API_TAGS } from '@shared/constants';

import { LoginRequestDTO } from './dtos/request.dto';
import { LoginService } from './login.service';

@ApiTags(API_TAGS.AUTH)
@Controller({ version: '1', path: 'login' })
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @ApiOperation({ summary: 'Login' })
  @Post()
  async handle(@Body() loginData: LoginRequestDTO): Promise<any> {
    console.log(loginData);
    return await this.loginService.execute();
  }
}
