import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

import { HEADERS } from '@shared/constants/headers';
import { getHeader } from '@shared/utils/getHeader.util';

import { ExceptionDTO } from './dtos/exception.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpException & { error: string; message: string },
    host: ArgumentsHost,
  ) {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const response = context.getResponse<FastifyReply>();
    const statusCode =
      Number(exception.getStatus()) || HttpStatus.INTERNAL_SERVER_ERROR;
    const transactionId = getHeader(request.headers, HEADERS.TRANSACTION_ID);

    const exceptionResponse = new ExceptionDTO(
      statusCode,
      exception.error,
      request.url,
      transactionId,
      exception.message,
    );

    response.code(statusCode).send(exceptionResponse);
  }
}
