export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '15m',
  REFRESH_TOKEN_EXPIRATION:
    process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/referer',
  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: Number(process.env.DATABASE_PORT) || 5432,
  DATABASE_USER: process.env.DATABASE_USER || 'postgres',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'postgres',
  DATABASE_NAME: process.env.DATABASE_NAME || 'referer',
};
