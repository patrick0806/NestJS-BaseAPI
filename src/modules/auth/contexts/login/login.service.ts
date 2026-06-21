import { Injectable } from '@nestjs/common';

import { LocalStrategy } from '@modules/auth/strategies/local.strategy';

import { LoginRequestDto } from './dtos/request.dto';

@Injectable()
export class LoginService {
  constructor(private localStrategy: LocalStrategy) {}
  async execute(loginData: LoginRequestDto) {
    await this.localStrategy.validate(loginData.email, loginData.password);
    return { accessToken: 'placeholder', expiresIn: '1d' };
  }
}
