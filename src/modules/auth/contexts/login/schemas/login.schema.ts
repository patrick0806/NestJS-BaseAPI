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
    'Credentials used to authenticate a user. Returns a short-lived JWT access token and a single-use refresh token on success.',
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
        'Access token lifetime in the format expected by `jsonwebtoken` (e.g. `15m`, `1h`).',
      ),
    refreshToken: z
      .string()
      .describe(
        'Opaque single-use refresh token. Send it to `POST /api/v1/auth/refresh` to obtain a new access token and a new refresh token. The previous refresh token is revoked on each rotation.',
      ),
    refreshExpiresAt: z
      .iso
      .datetime()
      .describe(
        'ISO-8601 timestamp at which the refresh token stops being valid.',
      ),
  })
  .describe(
    'Successful login response. Both tokens are required to access protected resources. Refresh tokens are single-use — reusing a revoked refresh token invalidates every active session for the user.',
  );

export class TokenResponseDto extends createZodDto(TokenResponseSchema) {}
