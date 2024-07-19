import { ApiProperty } from '@nestjs/swagger';

import { MetaResponseDTO } from '@shared/dtos/MetaResponse.dto';

class ContentDTO {
  @ApiProperty({ example: 'OK' })
  status: string;
  @ApiProperty({ example: {} })
  info: string;
  @ApiProperty({ example: {} })
  error: string;
  @ApiProperty({ example: {} })
  details: string;
}

export class HealthCheckResponseDTO extends MetaResponseDTO {
  @ApiProperty({ type: ContentDTO })
  content: ContentDTO;
}
