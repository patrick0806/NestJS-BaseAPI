import helmet from '@fastify/helmet';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { ApiReferenceConfig } from '@config/apiReference/apiReference.config';

import { API_BASE_PATH } from '@shared/constants';
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
  const apiReferenceConfig = new ApiReferenceConfig();
  apiReferenceConfig.setupApiReference(`${API_BASE_PATH}/docs`, app);

  app.useGlobalInterceptors(new BuildResponseInterceptor());
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? 'https://referer.com' : '*',
  });
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        scriptSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
        styleSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
        imgSrc: [`'self'`, 'data:', 'https://cdn.jsdelivr.net'],
        fontSrc: [`'self'`, 'data:', 'https://cdn.jsdelivr.net'],
        connectSrc: [`'self'`],
      },
    },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
