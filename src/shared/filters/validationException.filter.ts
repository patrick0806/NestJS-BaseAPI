import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

import { HEADERS } from '@shared/constants';
import { ValidationException } from '@shared/exceptions';
import { LogBuilderService } from '@shared/providers';
import { getHeader } from '@shared/utils';

import { ExceptionDetail, ExceptionDTO } from './dtos/exception.dto';

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private logger = LogBuilderService.getInstance();
  catch(exception: ValidationException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const response = context.getResponse<FastifyReply>();
    const transactionId = getHeader(request.headers, HEADERS.TRANSACTION_ID);

    const exceptionDeatils = new ExceptionDetail(
      'Invalid fields',
      exception.fields,
    );
    const exceptionResponse = new ExceptionDTO(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      request.url,
      transactionId,
      'Invalid fields send in request',
      [exceptionDeatils],
    );

    this.logger.build(
      {
        code: exception.error,
        message: exception.message,
        details: exceptionDeatils,
        level: 'warn',
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.url,
        statusCode: HttpStatus.BAD_REQUEST,
        transactionId,
      },
    );

    response.code(HttpStatus.BAD_REQUEST).send(exceptionResponse);
  }
}
