import helmet from '@fastify/helmet';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { SwaggerConfig } from '@config/swagger.config';

import { API_BASE_PATH } from '@shared/constants/apiBasePath';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const swaggerConfig = new SwaggerConfig();
  swaggerConfig.setupSwagger(`${API_BASE_PATH}/docs`, app);

  app.enableCors();
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix(API_BASE_PATH);
  await app.register(helmet);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
//TODO - logger
//TODO - error handling
//TODO - validation
//TODO - tests
