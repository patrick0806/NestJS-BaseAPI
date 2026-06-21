import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RefreshToken } from '@config/database/schema/refreshTokens';

import { RefreshTokenRepository } from '@shared/repositories';

import { RefreshService } from '../refresh.service';

const RAW = 'raw-refresh-token';
const HASH = `hash-of-${RAW}`;
const NEW_RAW = 'new-raw-refresh-token';
const NEW_HASH = 'new-hash';
const ACCESS = 'new-access-token';

vi.mock('@shared/utils', () => ({
  generateRefreshToken: () => ({ raw: NEW_RAW, hash: NEW_HASH }),
  hashRefreshToken: (raw: string) => `hash-of-${raw}`,
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

const validToken: RefreshToken = {
  id: 'rt-1',
  userId: 'user-1',
  tokenHash: HASH,
  expiresAt: new Date(Date.now() + 60_000),
  revokedAt: null,
  replacedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RefreshService', () => {
  let service: RefreshService;
  let refreshTokenRepository: {
    findByHash: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    revoke: ReturnType<typeof vi.fn>;
    revokeAllForUser: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    refreshTokenRepository = {
      findByHash: vi.fn(),
      save: vi.fn(),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
    };
    jwtService = { signAsync: vi.fn() };

    service = new RefreshService(
      jwtService as never,
      refreshTokenRepository as unknown as RefreshTokenRepository,
    );
  });

  it('rotates tokens on a valid refresh, persists only the hash, and revokes the old row', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue(validToken);
    refreshTokenRepository.save.mockResolvedValue({ id: 'rt-2' });
    jwtService.signAsync.mockResolvedValue(ACCESS);

    const result = await service.execute({ refreshToken: RAW });

    expect(refreshTokenRepository.findByHash).toHaveBeenCalledWith(HASH);
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    const persisted = refreshTokenRepository.save.mock.calls[0][0];
    expect(persisted.tokenHash).toBe(NEW_HASH);
    expect(persisted.tokenHash).not.toBe(NEW_RAW);
    expect(persisted.userId).toBe(validToken.userId);
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(
      validToken.id,
      'rt-2',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: validToken.userId,
    });
    expect(result).toEqual({
      accessToken: ACCESS,
      expiresIn: expect.any(String),
      refreshToken: NEW_RAW,
      refreshExpiresAt: expect.any(String),
    });
  });

  it('throws 401 when no token matches the hash and does not revoke anything', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue(null);

    await expect(
      service.execute({ refreshToken: RAW }),
    ).rejects.toMatchObject({ status: 401 });
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
    expect(refreshTokenRepository.revokeAllForUser).not.toHaveBeenCalled();
  });

  it('revokes every refresh token for the user when a revoked token is presented (reuse detection)', async () => {
    const revokedToken: RefreshToken = {
      ...validToken,
      revokedAt: new Date(),
    };
    refreshTokenRepository.findByHash.mockResolvedValue(revokedToken);

    await expect(
      service.execute({ refreshToken: RAW }),
    ).rejects.toMatchObject({ status: 401 });
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith(
      validToken.userId,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('throws 401 when the token is expired and does not revoke anything', async () => {
    const expiredToken: RefreshToken = {
      ...validToken,
      expiresAt: new Date(Date.now() - 1000),
    };
    refreshTokenRepository.findByHash.mockResolvedValue(expiredToken);

    await expect(
      service.execute({ refreshToken: RAW }),
    ).rejects.toMatchObject({ status: 401 });
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
    expect(refreshTokenRepository.revokeAllForUser).not.toHaveBeenCalled();
  });
});
