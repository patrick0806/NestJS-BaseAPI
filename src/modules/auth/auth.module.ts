import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { env } from '@config/env';

import { LoginController } from './contexts/login/login.controller';
import { LoginService } from './contexts/login/login.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRATION },
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
