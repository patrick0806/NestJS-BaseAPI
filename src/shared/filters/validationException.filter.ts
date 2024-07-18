import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { FastifyRequest, FastifyReply } from 'fastify';

import { HEADERS } from '@shared/constants';
import { getHeader } from '@shared/utils';

import { ExceptionDTO } from './dtos/exception.dto';

@Catch(ValidationError)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const response = context.getResponse<FastifyReply>();
    const transactionId = getHeader(request.headers, HEADERS.TRANSACTION_ID);

    const exceptionResponse = new ExceptionDTO(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      request.url,
      transactionId,
      'Invalid request payload',
    );

    response.code(HttpStatus.BAD_REQUEST).send(exceptionResponse);
  }
}
