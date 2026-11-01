import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(
      map((data) => ({
        data: data ?? null,
        error: false,
        code: context.switchToHttp().getResponse().statusCode,
      })),
    );
  }
}
