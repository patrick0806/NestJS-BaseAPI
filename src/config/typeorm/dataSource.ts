import * as path from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import env from '@config/env';

export const databaseOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: env().database.host,
  port: env().database.port,
  username: env().database.user,
  password: env().database.password,
  database: env().database.name,
  synchronize: false,
  logging: ['error'],
  entities: [
    path.join(__dirname, '..', '..', 'shared', 'entities', '*.entity.{ts,js}'),
  ],
  migrations: [path.join(__dirname, 'migrations', '*{.js,.ts}')],
  subscribers: [
    path.join(
      __dirname,
      '..',
      '..',
      'shared',
      'entities',
      'subscribers',
      '*.entity.subscriber.{ts,js}',
    ),
  ],
};

export const dataSource = new DataSource({ ...databaseOptions });
