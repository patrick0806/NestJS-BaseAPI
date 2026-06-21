import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginSchema = z
  .object({
    email: z
      .email()
      .describe(
        "User's email address used as the login identifier.",
      ),
    password: z
      .string()
      .min(1)
      .describe(
        "User's password in plain text. Must be sent over HTTPS.",
      ),
  })
  .describe(
    'Credentials used to authenticate a user. Returns a JWT access token on success.',
  );

export class LoginRequestDto extends createZodDto(LoginSchema) {}

export const TokenResponseSchema = z
  .object({
    accessToken: z
      .string()
      .describe(
        'Signed JWT access token. Send it in the `Authorization: Bearer <token>` header on subsequent requests.',
      ),
    expiresIn: z
      .string()
      .describe(
        'Token lifetime in the format expected by `jsonwebtoken` (e.g. `1d`, `12h`, `900s`).',
      ),
  })
  .describe(
    'Successful login response. The token expires after the time described by `expiresIn`.',
  );

export class TokenResponseDto extends createZodDto(TokenResponseSchema) {}
