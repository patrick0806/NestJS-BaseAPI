import helmet from '@fastify/helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { SwaggerConfig } from '@config/swagger/swagger.config';

import { API_BASE_PATH } from '@shared/constants';
import { ValidationException } from '@shared/exceptions';
import {
  HttpExceptionFilter,
  ValidationExceptionFilter,
} from '@shared/filters';
import { BuildResponseInterceptor } from '@shared/interceptors';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix(API_BASE_PATH);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  const swaggerConfig = new SwaggerConfig();
  swaggerConfig.setupSwagger(`${API_BASE_PATH}/docs`, app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors) => {
        throw new ValidationException(validationErrors);
      },
    }),
  );

  app.useGlobalInterceptors(new BuildResponseInterceptor());
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? 'https://referer.com' : '*',
  });
  await app.register(helmet);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
