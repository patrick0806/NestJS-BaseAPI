import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { env } from '@config/env';

import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '@shared/repositories';

import { generateRefreshToken, hashRefreshToken } from '@shared/utils';


import { RefreshRequestDto, RefreshResponseDto } from './schemas/refresh.schema';

@Injectable()
export class RefreshService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(dto: RefreshRequestDto): Promise<RefreshResponseDto> {
    const hash = hashRefreshToken(dto.refreshToken);
    const existing = await this.refreshTokenRepository.findByHash(hash);

    if (!existing) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      });
    }

    if (existing.revokedAt) {
      await this.refreshTokenRepository.revokeAllForUser(existing.userId);
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Refresh token reuse detected; all sessions revoked',
      });
    }

    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Refresh token has expired',
      });
    }

    const { raw: newRefreshRaw, hash: newHash } = generateRefreshToken();
    const expiresAt = this.computeExpiry();

    const inserted = await this.refreshTokenRepository.save({
      userId: existing.userId,
      tokenHash: newHash,
      expiresAt,
    });

    await this.refreshTokenRepository.revoke(existing.id, inserted.id);

    const accessToken = await this.jwtService.signAsync({
      sub: existing.userId,
    });

    return {
      accessToken,
      expiresIn: env.JWT_EXPIRATION as StringValue,
      refreshToken: newRefreshRaw,
      refreshExpiresAt: expiresAt.toISOString(),
    };
  }

  private computeExpiry(): Date {
    const match = /^(\d+)([smhd])$/.exec(env.REFRESH_TOKEN_EXPIRATION);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + value * (multipliers[unit] ?? 0));
  }
}
