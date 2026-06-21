import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from '@config/database/database.module';
import { env } from '@config/env';

import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '@shared/repositories';

import { LoginController } from './contexts/login/login.controller';
import { LoginService } from './contexts/login/login.service';
import { UsersRepository } from './contexts/login/users.repository';
import { LogoutController } from './contexts/logout/logout.controller';
import { LogoutService } from './contexts/logout/logout.service';
import { RefreshController } from './contexts/refresh/refresh.controller';
import { RefreshService } from './contexts/refresh/refresh.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRATION as any },
    }),
  ],
  controllers: [LoginController, RefreshController, LogoutController],
  providers: [
    LoginService,
    UsersRepository,
    RefreshService,
    LogoutService,
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenRepository,
    },
    JwtStrategy,
  ],
})
export class AuthModule {}
