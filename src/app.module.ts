import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { JWTAuthGuard, RolesGuard } from '@shared/guards';

import { AuthModule } from '@modules/auth/auth.module';
import { HealthModule } from '@modules/health/health.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    RouterModule.register([
      {
        path: 'health',
        module: HealthModule,
      },
      {
        path: 'auth',
        module: AuthModule,
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JWTAuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
