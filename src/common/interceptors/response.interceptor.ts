import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ApiResponseDto } from '../dto/response/api-response.dto';

// Custom decorator to skip the response interceptor
export const SkipResponseInterceptor = () =>
  Reflect.metadata('skipResponseInterceptor', true);

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipInterceptor = this.reflector.getAllAndOverride<boolean>(
      'skipResponseInterceptor',
      [context.getHandler(), context.getClass()],
    );

    if (skipInterceptor) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'message' in data &&
          'status' in data
        ) {
          return data;
        }

        const statusCode = response.statusCode || HttpStatus.OK;

        const method = request.method;
        let message = 'Operation completed successfully';

        switch (method) {
          case 'POST':
            message =
              statusCode === HttpStatus.CREATED
                ? 'Resource created successfully'
                : 'Operation completed successfully';
            break;
          case 'GET':
            message = Array.isArray(data)
              ? 'Resources retrieved successfully'
              : 'Resource retrieved successfully';
            break;
          case 'PUT':
          case 'PATCH':
            message = 'Resource updated successfully';
            break;
          case 'DELETE':
            message = 'Resource deleted successfully';
            break;
          default:
            message = 'Operation completed successfully';
        }

        if (method === 'DELETE' && (data === null || data === undefined)) {
          data = null;
        }

        return ApiResponseDto.success(data, message, statusCode);
      }),
    );
  }
}
