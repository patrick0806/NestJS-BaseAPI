import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDTO {
  @ApiProperty({
    description:
      "Top-level status of the health check. `ok` when every indicator is up, `error` or `shutting_down` otherwise.",
    example: 'ok',
  })
  status: 'ok' | 'error' | 'shutting_down' | string;

  @ApiProperty({
    description:
      'Map of indicator keys to their data when their status is `up`. Empty when every indicator is down.',
    type: 'object',
    additionalProperties: true,
    example: { database: { status: 'up' } },
  })
  info: Record<string, unknown>;

  @ApiProperty({
    description:
      'Map of indicator keys to their error data when their status is `down`. Empty when every indicator is up.',
    type: 'object',
    additionalProperties: true,
    example: {},
  })
  error: Record<string, unknown>;

  @ApiProperty({
    description:
      'Map of indicator keys to their full result. Always populated, even for indicators that are up.',
    type: 'object',
    additionalProperties: true,
    example: { database: { status: 'up' } },
  })
  details: Record<string, unknown>;
}
