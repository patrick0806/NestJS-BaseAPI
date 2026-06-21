import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { DrizzleDatabase } from '@config/database/database.module';
import { DRIZZLE } from '@config/database/database.tokens';
import { users } from '@config/database/schema';
import type { User } from '@config/database/schema/users';

import { BaseRepository } from '@shared/repositories';

@Injectable()
export class UsersRepository extends BaseRepository<typeof users, User> {
  constructor(@Inject(DRIZZLE) db: DrizzleDatabase) {
    super(db, users);
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return (rows[0] as User | undefined) ?? null;
  }
}
