import { DocumentBuilder } from '@nestjs/swagger';

export const getSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();
};
