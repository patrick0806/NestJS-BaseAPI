import { HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';

export class ValidationException {
  name: string;
  message: string;
  status: number;
  error: string;
  fields: Array<{
    name: string;
    reason: string;
  }>;

  constructor(zodError: ZodError) {
    this.fields = zodError.issues.map((issue) => ({
      name: issue.path.join('.') || 'body',
      reason: issue.message,
    }));
    this.name = 'ValidationException';
    this.error = 'Invalid params';
    this.message = 'Invalid params send in request';
    this.status = HttpStatus.BAD_REQUEST;
  }
}
