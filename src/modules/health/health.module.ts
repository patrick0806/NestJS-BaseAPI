import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CheckController } from './contexts/check/check.controller';
import { CheckService } from './contexts/check/check.service';

@Module({
  imports: [TerminusModule],
  controllers: [CheckController],
  providers: [CheckService],
})
export class HealthModule {}
