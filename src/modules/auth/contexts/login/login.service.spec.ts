import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@config/database/schema/users';

import { RefreshTokenRepository } from '@shared/repositories';

import * as shared from '@shared/utils';

import { LoginService } from './login.service';
import { UsersRepository } from './users.repository';


const RAW_REFRESH = 'raw-refresh-token';
const REFRESH_HASH = 'hashed-refresh-token';
const ACCESS_TOKEN = 'signed-jwt-access-token';

vi.mock('@shared/utils', () => ({
  generateRefreshToken: () => ({ raw: RAW_REFRESH, hash: REFRESH_HASH }),
  hashRefreshToken: (raw: string) => `hash-of-${raw}`,
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

const mockUser: User = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'demo@referer.com',
  passwordHash: '$2b$10$bcrypt-hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('LoginService', () => {
  let service: LoginService;
  let usersRepository: { findByEmail: ReturnType<typeof vi.fn> };
  let refreshTokenRepository: { save: ReturnType<typeof vi.fn> };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };
  const verifyPasswordSpy = shared.verifyPassword as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
    usersRepository = { findByEmail: vi.fn() };
    refreshTokenRepository = { save: vi.fn() };
    jwtService = { signAsync: vi.fn() };

    service = new LoginService(
      jwtService as never,
      usersRepository as unknown as UsersRepository,
      refreshTokenRepository as unknown as RefreshTokenRepository,
    );
  });

  it('issues access + refresh tokens and persists only the hash on valid credentials', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    verifyPasswordSpy.mockResolvedValue(true);
    refreshTokenRepository.save.mockResolvedValue({ id: 'rt-1' });
    jwtService.signAsync.mockResolvedValue(ACCESS_TOKEN);

    const result = await service.execute({
      email: mockUser.email,
      password: 'demo',
    });

    expect(usersRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
    expect(verifyPasswordSpy).toHaveBeenCalledWith(
      'demo',
      mockUser.passwordHash,
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
    });
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    const persisted = refreshTokenRepository.save.mock.calls[0][0];
    expect(persisted.tokenHash).toBe(REFRESH_HASH);
    expect(persisted.tokenHash).not.toBe(RAW_REFRESH);
    expect(persisted.userId).toBe(mockUser.id);
    expect(persisted.expiresAt).toBeInstanceOf(Date);
    expect(result).toEqual({
      accessToken: ACCESS_TOKEN,
      expiresIn: expect.any(String),
      refreshToken: RAW_REFRESH,
      refreshExpiresAt: expect.any(String),
    });
  });

  it('throws UnauthorizedException when the email is unknown', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.execute({ email: 'missing@x.com', password: 'whatever' }),
    ).rejects.toMatchObject({ status: 401 });
    expect(verifyPasswordSpy).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when the password is wrong and never persists a token', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    verifyPasswordSpy.mockResolvedValue(false);

    await expect(
      service.execute({ email: mockUser.email, password: 'wrong' }),
    ).rejects.toMatchObject({ status: 401 });
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });
});
