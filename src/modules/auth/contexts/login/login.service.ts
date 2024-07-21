import { Injectable } from '@nestjs/common';

import { LocalStrategy } from '@modules/auth/strategies/local.strategy';

import { LoginRequestDTO } from './dtos/request.dto';

@Injectable()
export class LoginService {
  constructor(private localStrategy: LocalStrategy) {}
  async execute(loginData: LoginRequestDTO): Promise<any> {
    await this.localStrategy.validate(loginData.email, loginData.password);
    return 'Hello World';
  }
}
