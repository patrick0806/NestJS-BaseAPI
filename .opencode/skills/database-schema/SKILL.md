---
name: database-schema
description: Create new Drizzle ORM tables, run migrations, and write seed scripts following this project's database conventions. Use when the user wants to add a new database table, modify schema, create a migration, or write seed data.
---

# Database Schema Skill

## When to Use

The user wants to add a new database table, modify schema, create a migration, or write seed data.

## Schema File Location

All Drizzle schemas live in: `src/config/database/schema/`

Structure:
```
src/config/database/schema/
  index.ts           # barrel export — MUST add new tables here
  base.entity.ts     # shared id/createdAt/updatedAt columns
  users.ts           # users table
  refreshTokens.ts   # refresh_tokens table
  <newTable>.ts      # YOUR NEW TABLE
```

## Creating a New Table

### Template

File: `src/config/database/schema/<tableName>.ts`

```typescript
import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { baseEntity } from './base.entity';

export const <tableName> = pgTable(
  '<db_table_name>',  // snake_case
  {
    ...baseEntity,
    // FK example:
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // String column:
    name: varchar('name', { length: 255 }).notNull(),

    // Optional timestamp:
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    // Computed default:
    expiresAt: timestamp('expires_at', { withTimezone: true })
      .notNull()
      .default(sql`now() + interval '30 days'`),
  },
  (t) => ({
    // Indexes for FK and frequently queried columns:
    userIdIdx: index('idx_<table>_user_id').on(t.userId),
    nameIdx: index('idx_<table>_name').on(t.name),
  }),
);

export const Insert<Item>Schema = createInsertSchema(<tableName>);
export const Select<Item>Schema = createSelectSchema(<tableName>);
export type <Item> = typeof <tableName>.$inferSelect;
export type New<Item> = typeof <tableName>.$inferInsert;
```

### Naming Rules

| Element | Convention | Example |
|---------|-----------|---------|
| JS property | camelCase | `userId`, `tokenHash` |
| DB column | snake_case | `user_id`, `token_hash` |
| DB table | snake_case | `refresh_tokens`, `product_items` |
| Index name | `idx_<table>_<column>` | `idx_refresh_tokens_user_id` |
| Type | PascalCase | `RefreshToken`, `NewRefreshToken` |
| Schema (drizzle-zod) | `Insert` + `Select` prefix | `InsertRefreshTokenSchema` |

### Column Types Reference

```typescript
import { sql } from 'drizzle-orm';
import {
  boolean, index, integer, jsonb, pgTable,
  text, timestamp, uuid, varchar
} from 'drizzle-orm/pg-core';

// UUID (via baseEntity)
uuid('column_name').notNull().default(sql`gen_random_uuid()`)

// String
varchar('column_name', { length: 255 }).notNull()
text('column_name').notNull()

// Number
integer('column_name').notNull().default(0)

// Boolean
boolean('column_name').notNull().default(false)

// JSON
jsonb('column_name').$type<Record<string, unknown>>().default({})

// Timestamp (via baseEntity)
timestamp('column_name', { withTimezone: true }).defaultNow().notNull()

// Custom default
timestamp('column_name', { withTimezone: true })
  .notNull()
  .default(sql`now() + interval '7 days'`)
```

### Foreign Keys

```typescript
// With cascade delete
userId: uuid('user_id')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' })

// Without cascade (restrict)
parentId: uuid('parent_id')
  .notNull()
  .references(() => parents.id)
```

### Indexes

Always add indexes on:
- Foreign key columns
- Columns used in WHERE clauses
- Columns used in ORDER BY

```typescript
(userId: uuid('user_id').notNull().references(...)),
(t) => ({
  userIdIdx: index('idx_table_user_id').on(t.userId),
})
```

## Export from Index

After creating a schema file, add it to `src/config/database/schema/index.ts`:

```typescript
export * from './base.entity';
export * from './refreshTokens';
export * from './users';
export * from './<newTable>';  // ADD THIS
```

## Generate Migration

```bash
npm run db:generate
```

This diffs the schema against existing migrations and creates a new SQL file in `src/config/database/migrations/`.

### Apply Migration

```bash
npm run db:migrate
```

### Quick Push (prototyping only)

```bash
npm run db:push
```

Pushes schema directly without generating migration files.

## Creating Seeds

### Seed File Location

```
src/config/database/seeds/
  seed.ts           # seed runner — add new seed calls here
  users.seed.ts     # existing seed
  <newTable>.seed.ts  # YOUR NEW SEED
```

### Seed Template

File: `src/config/database/seeds/<table>.seed.ts`

```typescript
import { <tableName> } from '@config/database/schema';
import { DrizzleDatabase } from '@config/database/database.module';

export async function seed<Items>(db: DrizzleDatabase): Promise<void> {
  await db
    .insert(<tableName>)
    .values([
      { email: 'admin@example.com', passwordHash: '...' },
      { email: 'user@example.com', passwordHash: '...' },
    ])
    .onConflictDoNothing({ target: <tableName>.email });

  console.log('Seeded <table> successfully.');
}
```

### Register in Seed Runner

Edit `src/config/database/seeds/seed.ts`:

```typescript
import { seedUsers } from './users.seed';
import { seed<Items> } from './<table>.seed';

async function main(): Promise<void> {
  try {
    await seedUsers(db);
    await seed<Items>(db);  // ADD THIS
    console.log('Seeds applied successfully.');
  } finally {
    await client.end();
  }
}
```

### Run Seeds

```bash
npm run db:seed
```

## Drizzle Studio (Browse Data)

```bash
npm run db:studio
```

Opens a web UI to browse and edit data directly.

## Common Patterns

### Soft Delete

Add a `deletedAt` column instead of hard-deleting:

```typescript
deletedAt: timestamp('deleted_at', { withTimezone: true }),
```

Query with: `.where(isNull(<table>.deletedAt))`

### Audit Trail

Use `baseEntity` timestamps + a separate audit log table.

### JSONB Flexible Data

```typescript
metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
```
