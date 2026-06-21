import type { DrizzleDatabase } from '../database.module';
import { users } from '../schema';

export async function seedUsers(db: DrizzleDatabase): Promise<void> {
  await db
    .insert(users)
    .values({
      email: 'demo@referer.com',
      passwordHash: '$2b$10$placeholderplaceholderplaceholderplaceholderplaceh',
    })
    .onConflictDoNothing({ target: users.email });
}
