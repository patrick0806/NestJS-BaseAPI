import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { defaultResponses } from './defaultResponses.swagger';
import { GlobalApiResponses } from './globalApiResponses.swagger';

export class SwaggerConfig {
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

  private createDocument(app: INestApplication<any>) {
    return SwaggerModule.createDocument(app, SwaggerConfig.documentation);
  }

  setupSwagger(path: string, app: INestApplication<any>) {
    const document = this.createDocument(app);
    GlobalApiResponses({
      document,
      excludedPaths: ['/api/v1/health'],
      methods: ['get', 'post', 'put', 'patch', 'delete'],
      responses: defaultResponses,
    });
    SwaggerModule.setup(path, app, document);
  }
}
