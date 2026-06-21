import { createZodDto } from 'nestjs-zod';

import { LoginSchema } from '../schemas/login.schema';

export class LoginRequestDto extends createZodDto(LoginSchema) {}
