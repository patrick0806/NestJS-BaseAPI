import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RefreshToken } from '@config/database/schema/refreshTokens';

import { RefreshTokenRepository } from '@shared/repositories';

import { LogoutService } from './logout.service';

vi.mock('@shared/utils', () => ({
  generateRefreshToken: vi.fn(),
  hashRefreshToken: (raw: string) => `hash-of-${raw}`,
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

const RAW = 'raw-refresh-token';
const HASH = `hash-of-${RAW}`;

const activeToken: RefreshToken = {
  id: 'rt-1',
  userId: 'user-1',
  tokenHash: HASH,
  expiresAt: new Date(Date.now() + 60_000),
  revokedAt: null,
  replacedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('LogoutService', () => {
  let service: LogoutService;
  let refreshTokenRepository: {
    findByHash: ReturnType<typeof vi.fn>;
    revoke: ReturnType<typeof vi.fn>;
    revokeAllForUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    refreshTokenRepository = {
      findByHash: vi.fn(),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
    };
    service = new LogoutService(
      refreshTokenRepository as unknown as RefreshTokenRepository,
    );
  });

  it('revokes the targeted refresh token when found and active', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue(activeToken);

    const result = await service.execute({ refreshToken: RAW });

    expect(refreshTokenRepository.findByHash).toHaveBeenCalledWith(HASH);
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(activeToken.id);
    expect(refreshTokenRepository.revokeAllForUser).not.toHaveBeenCalled();
    expect(result).toEqual({ revoked: true });
  });

  it('is a no-op when the token does not exist', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue(null);

    const result = await service.execute({ refreshToken: RAW });

    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
    expect(refreshTokenRepository.revokeAllForUser).not.toHaveBeenCalled();
    expect(result).toEqual({ revoked: true });
  });

  it('does not re-revoke a token that is already revoked', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue({
      ...activeToken,
      revokedAt: new Date(),
    });

    const result = await service.execute({ refreshToken: RAW });

    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
    expect(result).toEqual({ revoked: true });
  });
});
