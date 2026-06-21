import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { databaseConfig } from './database.config';
import { DRIZZLE } from './database.tokens';
import { DrizzleHealthIndicator } from './health/drizzle.health';
import * as schema from './schema';

export { DRIZZLE } from './database.tokens';

export type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;

@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (): DrizzleDatabase =>
        drizzle(postgres(databaseConfig.url), { schema }),
    },
    DrizzleHealthIndicator,
  ],
  exports: [DRIZZLE, DrizzleHealthIndicator],
})
export class DatabaseModule {}
