import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '@config/database/database.module';

import { CheckController } from './contexts/check/check.controller';
import { CheckService } from './contexts/check/check.service';

@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [CheckController],
  providers: [CheckService],
})
export class HealthModule {}
