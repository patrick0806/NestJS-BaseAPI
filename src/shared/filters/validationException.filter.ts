import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

import { HEADERS } from '@shared/constants';
import { ValidationException } from '@shared/exceptions';
import { getHeader } from '@shared/utils';

import { ExceptionDetail, ExceptionDTO } from './dtos/exception.dto';

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
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

    response.code(HttpStatus.BAD_REQUEST).send(exceptionResponse);
  }
}
