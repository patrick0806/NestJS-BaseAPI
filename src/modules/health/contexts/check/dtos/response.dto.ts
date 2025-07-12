import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDTO {
  @ApiProperty({ example: 'OK' })
  status: Record<string, unknown>;
  @ApiProperty({ example: {} })
  info: Record<string, unknown>;
  @ApiProperty({ example: {} })
  error: Record<string, unknown>;
  @ApiProperty({ example: {} })
  details: Record<string, unknown>;
}
