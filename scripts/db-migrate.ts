import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { databaseConfig } from '../src/config/database/database.config';

const client = postgres(databaseConfig.url, { max: 1 });
const db = drizzle(client);

async function main(): Promise<void> {
  try {
    await migrate(db, {
      migrationsFolder: './src/config/database/migrations',
    });
    console.log('Migrations applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
