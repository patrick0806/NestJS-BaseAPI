import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { defaultResponses } from './defaultResponses';

type DefaultResponses = Record<string, Record<string, unknown>>;

export class ApiReferenceConfig {
  static documentation = new DocumentBuilder()
    .setTitle('Referer api')
    .setVersion('1.0')
    .setContact(
      'Patrick da Silva Nicezi',
      'https://github.com/patrick0806',
      'patrickk0806@gmail.com',
    )
    .addBearerAuth()
    .build();

  setupApiReference(path: string, app: INestApplication<any>) {
    let document = this.createDocument(app);
    this.defineGlobalResponses({
      document,
      excludedPaths: ['/api/v1/health'],
      methods: ['get', 'post', 'put', 'patch', 'delete'],
      responses: defaultResponses,
    });
    document = cleanupOpenApiDoc(document);
    app.use(
      path,
      apiReference({
        content: document,
        withFastify: true,
      }),
    );
  }

  private createDocument(app: INestApplication<any>) {
    return SwaggerModule.createDocument(app, ApiReferenceConfig.documentation);
  }

  private defineGlobalResponses({
    document,
    excludedPaths,
    methods,
    responses,
  }: {
    document: OpenAPIObject;
    excludedPaths: string[];
    methods: string[];
    responses: DefaultResponses;
  }) {
    for (const key in document.paths) {
      if (!excludedPaths.includes(key)) {
        methods.forEach((method) => {
          if (document.paths[key][method]) {
            document.paths[key][method].responses = {
              ...responses,
              ...document.paths[key][method].responses,
            };
          }
        });
      }
    }
  }
}
