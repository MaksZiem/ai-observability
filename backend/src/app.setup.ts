import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { createValidationPipe } from './common/pipes/validation.pipe.js';

export function configureApp(app: NestExpressApplication): void {
  app.set('trust proxy', 1);
  app.useBodyParser('json', { limit: '5mb' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    createValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
}
