import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { HealthModule } from '@modules/health/health.module';

@Module({
  imports: [
    HealthModule,
    RouterModule.register([
      {
        path: 'health',
        module: HealthModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
