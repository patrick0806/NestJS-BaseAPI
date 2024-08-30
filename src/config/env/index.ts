import 'dotenv/config';
export default () => ({
  application: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
      secrect: process.env.JWT_SECRET || 'secret',
      expiration: process.env.JWT_EXPIRATION || '1d',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'secret',
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    name: process.env.DATABASE_NAME || 'postgres',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123456',
  },
});
