import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';

import type { DrizzleDatabase } from '@config/database/database.module';
import { DRIZZLE } from '@config/database/database.tokens';
import { refreshTokens } from '@config/database/schema';
import type { RefreshToken } from '@config/database/schema/refreshTokens';

import { BaseRepository } from './base.repository';

export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<
  typeof refreshTokens,
  RefreshToken
> {
  constructor(@Inject(DRIZZLE) db: DrizzleDatabase) {
    super(db, refreshTokens);
  }

  async findValidByHash(hash: string): Promise<RefreshToken | null> {
    const rows = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, hash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, sql`now()`),
        ),
      )
      .limit(1);

    return (rows[0] as RefreshToken | undefined) ?? null;
  }

  async findByHash(hash: string): Promise<RefreshToken | null> {
    const rows = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hash))
      .limit(1);

    return (rows[0] as RefreshToken | undefined) ?? null;
  }

  async revoke(id: string, replacedById?: string): Promise<void> {
    const update: { revokedAt: Date; replacedById?: string } = {
      revokedAt: new Date(),
    };
    if (replacedById) {
      update.replacedById = replacedById;
    }
    await this.db
      .update(refreshTokens)
      .set(update)
      .where(eq(refreshTokens.id, id));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }
}
