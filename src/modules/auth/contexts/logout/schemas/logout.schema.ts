import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LogoutSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1)
      .describe(
        'Opaque refresh token to revoke. After this call the token cannot be used to obtain a new access token. Idempotent — calling with an already-revoked or unknown token still returns 200.',
      ),
  })
  .describe(
    'Payload for revoking a refresh token and ending the current session.',
  );

export class LogoutRequestDto extends createZodDto(LogoutSchema) {}

export const LogoutResponseSchema = z
  .object({
    revoked: z
      .literal(true)
      .describe(
        'Always `true` when the request was processed. Logout is idempotent — the same response is returned whether the token existed, was already revoked, or was unknown.',
      ),
  })
  .describe('Successful logout response.');

export class LogoutResponseDto extends createZodDto(LogoutResponseSchema) {}
