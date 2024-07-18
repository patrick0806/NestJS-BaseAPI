import { Module } from '@nestjs/common';

import { LoginController } from './contexts/login/login.controller';
import { LoginService } from './contexts/login/login.service';

@Module({
  imports: [],
  controllers: [LoginController],
  providers: [LoginService],
})
export class AuthModule {}
