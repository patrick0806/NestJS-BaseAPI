import { ApiProperty } from '@nestjs/swagger';

class Meta {
  @ApiProperty({ example: '2021-09-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '184165384841846' })
  transactionId: string;
}

export class MetaResponseDTO {
  @ApiProperty({ type: Meta })
  meta: Meta;
}
