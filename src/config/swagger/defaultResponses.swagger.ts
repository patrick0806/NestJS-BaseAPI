import { HttpStatus } from '@nestjs/common';
import {
  PathsObject,
  ResponseObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { ExceptionDTO } from '@shared/filters/dtos/exception.dto';

const badRequestResponse = {
  '400': {
    description: 'The request did not match the Data Transfer Object.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: new ExceptionDTO(
            HttpStatus.BAD_REQUEST,
            'Bad Request',
            'url',
            'transactionId',
            'Invalid fields send in request',
            [
              {
                message: 'Invalid fields',
                additionalProperties: [
                  {
                    name: 'name',
                    reason: 'reason',
                  },
                ],
              },
            ],
          ),
        },
      },
    },
  } as ResponseObject,
};

const unauthorizedResponse = {
  '401': {
    description: 'Added token is invalid or token type is incorrect',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: new ExceptionDTO(
            HttpStatus.UNAUTHORIZED,
            'Unauthorized',
            'url',
            'transactionId',
            'Invalid token',
          ),
        },
      },
    },
  } as ResponseObject,
};

const forbbidenResponse = {
  '403': {
    description: 'The user does not have permission to access the resource',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: new ExceptionDTO(
            HttpStatus.FORBIDDEN,
            'Forbidden',
            'url',
            'transactionId',
            'User does not have permission to access the resource',
          ),
        },
      },
    },
  } as ResponseObject,
};

const conflictResponse = {
  '409': {
    description:
      'The request could not be completed due to a conflict with the current state of the target resource',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: new ExceptionDTO(
            HttpStatus.CONFLICT,
            'Conflict',
            'url',
            'transactionId',
            'Conflict with the current state of the target resource',
          ),
        },
      },
    },
  } as ResponseObject,
};

const notFoundResponse = {
  '404': {
    description: 'The requested resource was not found',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: new ExceptionDTO(
            HttpStatus.NOT_FOUND,
            'Not Found',
            'url',
            'transactionId',
            'The requested resource was not found',
          ),
        },
      },
    },
  } as ResponseObject,
};

const internalServerErrorResponse = {
  '500': {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: new ExceptionDTO(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Internal Server Error',
            'url',
            'transactionId',
            'Internal server error',
          ),
        },
      },
    },
  } as ResponseObject,
};

export const defaultResponses: PathsObject = {
  ...badRequestResponse,
  ...unauthorizedResponse,
  ...forbbidenResponse,
  ...notFoundResponse,
  ...conflictResponse,
  ...internalServerErrorResponse,
};
