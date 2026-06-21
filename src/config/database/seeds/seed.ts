import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { databaseConfig } from '../database.config';
import * as schema from '../schema';
import { seedUsers } from './users.seed';

const client = postgres(databaseConfig.url, { max: 1 });
const db = drizzle(client, { schema });

async function main(): Promise<void> {
  try {
    await seedUsers(db);
    console.log('Seeds applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
