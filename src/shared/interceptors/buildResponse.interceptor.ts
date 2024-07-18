import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { map, Observable } from 'rxjs';

import { HEADERS } from '@shared/constants/headers';
import { IMetadaResponse } from '@shared/interfaces/response.interface';
import { getHeader } from '@shared/utils/getHeader.util';

@Injectable()
export class BuildResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((params) => {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const metadata: IMetadaResponse = {
          timestamp: new Date().toISOString(),
          transactionId: getHeader(request.headers, HEADERS.TRANSACTION_ID),
        };
        return {
          meta: metadata,
          content: params,
        };
      }),
    );
  }
}
