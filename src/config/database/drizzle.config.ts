import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/config/database/schema/index.ts',
  out: './src/config/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/referer',
  },
  casing: 'snake_case',
  strict: true,
  verbose: true,
});
