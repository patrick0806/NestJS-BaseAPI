import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';


export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class LoginRequestDto extends createZodDto(LoginSchema) {}

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.string(),
});

export class TokenResponseDto extends createZodDto(TokenResponseSchema) {}
