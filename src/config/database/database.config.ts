import { env } from '@config/env';

export const databaseConfig = {
  url: env.DATABASE_URL,
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
} as const;

export type DatabaseConfig = typeof databaseConfig;
