import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { getSwaggerConfig } from '../config/swagger.config.js';

export function setupSwagger(app: INestApplication) {
  const config = getSwaggerConfig();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: '/swagger.json',
    yamlDocumentUrl: '/swagger.yaml',
    customSiteTitle: 'NestJS API',
  });
}
