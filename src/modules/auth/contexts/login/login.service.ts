import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { User } from '@config/database/schema/users';
import { env } from '@config/env';

import { REFRESH_TOKEN_REPOSITORY, RefreshTokenRepository } from '@shared/repositories';
import { generateRefreshToken, verifyPassword } from '@shared/utils';


import { LoginRequestDto, TokenResponseDto } from './schemas/login.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class LoginService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(dto: LoginRequestDto): Promise<TokenResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Invalid credentials, check your email and password',
      });
    }

    const valid = await verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Invalid credentials, check your email and password',
      });
    }

    return this.issueTokenPair(user);
  }

  private async issueTokenPair(
    user: User,
  ): Promise<TokenResponseDto> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    const { raw: refreshToken, hash } = generateRefreshToken();
    const refreshExpiresAt = this.computeRefreshExpiry();

    const saved = await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash: hash,
      expiresAt: refreshExpiresAt,
    });
    void saved;

    return {
      accessToken,
      expiresIn: env.JWT_EXPIRATION,
      refreshToken,
      refreshExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  private computeRefreshExpiry(): Date {
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
