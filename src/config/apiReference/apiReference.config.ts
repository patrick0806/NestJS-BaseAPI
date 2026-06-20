import { apiReference } from '@scalar/nestjs-api-reference';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { defaultResponses } from './defaultResponses';

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
    const document = this.createDocument(app);
    this.defineGlobalResponses({
      document,
      excludedPaths: ['/api/v1/health'],
      methods: ['get', 'post', 'put', 'patch', 'delete'],
      responses: defaultResponses,
    });
    app.use(
      path,
      apiReference({
        content: document,
        withFastify: true,
        theme: 'nestjs',
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
    responses: PathsObject;
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
