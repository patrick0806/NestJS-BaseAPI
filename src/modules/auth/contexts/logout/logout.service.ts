import { Inject, Injectable } from '@nestjs/common';

import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '@shared/repositories';
import { hashRefreshToken } from '@shared/utils';


import { LogoutRequestDto, LogoutResponseDto } from './schemas/logout.schema';

@Injectable()
export class LogoutService {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(dto: LogoutRequestDto): Promise<LogoutResponseDto> {
    const hash = hashRefreshToken(dto.refreshToken);
    const existing = await this.refreshTokenRepository.findByHash(hash);

    if (existing && !existing.revokedAt) {
      await this.refreshTokenRepository.revoke(existing.id);
    }

    return { revoked: true };
  }
}
