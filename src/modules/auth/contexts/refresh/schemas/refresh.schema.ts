import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RefreshSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1)
      .describe(
        'Opaque refresh token previously returned by `POST /api/v1/auth/login` or a prior refresh. Single-use — each successful call revokes the presented token and issues a new pair.',
      ),
  })
  .describe(
    'Payload for exchanging a valid refresh token for a new access + refresh pair.',
  );

export class RefreshRequestDto extends createZodDto(RefreshSchema) {}

export const RefreshResponseSchema = z
  .object({
    accessToken: z
      .string()
      .describe(
        'Newly issued JWT access token. Send it in the `Authorization: Bearer <token>` header on subsequent requests.',
      ),
    expiresIn: z
      .string()
      .describe(
        'Access token lifetime in the format expected by `jsonwebtoken` (e.g. `15m`, `1h`).',
      ),
    refreshToken: z
      .string()
      .describe(
        'Newly issued opaque refresh token. The previous refresh token has been revoked and can no longer be used.',
      ),
    refreshExpiresAt: z
      .iso
      .datetime()
      .describe(
        'ISO-8601 timestamp at which the new refresh token stops being valid.',
      ),
  })
  .describe(
    'Successful refresh response. The previous refresh token is now revoked — only the new one is valid for further calls.',
  );

export class RefreshResponseDto extends createZodDto(RefreshResponseSchema) {}
