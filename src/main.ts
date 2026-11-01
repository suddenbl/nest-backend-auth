import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { setupSwagger } from './utils/swagger.util.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  setupSwagger(app);

  await app.listen(3000);
}
await bootstrap();
