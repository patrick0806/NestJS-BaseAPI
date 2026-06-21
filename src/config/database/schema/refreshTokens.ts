import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { baseEntity } from './base.entity';
import { users } from './users';

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    ...baseEntity,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true })
      .notNull()
      .default(sql`now() + interval '7 days'`),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    replacedById: uuid('replaced_by_id'),
  },
  (t) => ({
    userIdIdx: index('idx_refresh_tokens_user_id').on(t.userId),
  }),
);

export const InsertRefreshTokenSchema = createInsertSchema(refreshTokens);
export const SelectRefreshTokenSchema = createSelectSchema(refreshTokens);

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
