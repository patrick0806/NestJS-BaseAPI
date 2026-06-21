---
name: create-endpoint
description: Scaffold a new NestJS module with context-based controller, service, Zod schemas, DTOs, repository, and tests following this project's conventions. Use when the user wants to add a new API endpoint, module, resource, or CRUD operation.
---

# Create Endpoint Skill

## When to Use

The user wants to add a new API endpoint, module, or resource to the project.

## Workflow

### Step 1: Identify the module and context

Ask the user (or infer):
- **Module name** (e.g., `products`, `orders`) — becomes `src/modules/<name>/`
- **Context name** (e.g., `create`, `list`, `get-by-id`) — becomes `src/modules/<name>/contexts/<context>/`
- **HTTP method + path** (e.g., `POST /products`)
- **Auth requirement**: public (`@Public()`) or role-restricted (`@Roles(...)`)?

### Step 2: Create the database schema

File: `src/config/database/schema/<tableName>.ts`

Follow this exact pattern (from `users.ts`):

```typescript
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { baseEntity } from './base.entity';

export const <tableName> = pgTable('<db_table_name>', {
  ...baseEntity,
  <fieldName>: <drizzleType>('<db_column_name>', { ...options }).notNull(),
});

export const Insert<Item>Schema = createInsertSchema(<tableName>);
export const Select<Item>Schema = createSelectSchema(<tableName>);
export type <Item> = typeof <tableName>.$inferSelect;
export type New<Item> = typeof <tableName>.$inferInsert;
```

Rules:
- DB table name: snake_case (e.g., `product_items`)
- JS property: camelCase (e.g., `productItemId`)
- DB column: snake_case (e.g., `product_item_id`)
- Always spread `...baseEntity` first
- FK: `.references(() => otherTable.id, { onDelete: 'cascade' })`
- Indexes: third argument to `pgTable()`
- Export from `src/config/database/schema/index.ts`

### Step 3: Generate migration

```bash
npm run db:generate
```

Review the generated SQL in `src/config/database/migrations/`.

### Step 4: Create the Zod schema + DTOs

File: `src/modules/<module>/contexts/<context>/schemas/<context>.schema.ts`

```typescript
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const Create<Item>Schema = z.object({
  <field>: z.<type>().<validations>().describe('<description>'),
}).describe('<schema description>');

export class Create<Item>RequestDto extends createZodDto(Create<Item>Schema) {}

export const <Item>ResponseSchema = z.object({
  id: z.uuid().describe('Unique identifier'),
  <field>: z.<type>().describe('<description>'),
  createdAt: z.iso.datetime().describe('Creation timestamp'),
}).describe('<response description>');

export class <Item>ResponseDto extends createZodDto(<Item>ResponseSchema) {}
```

Rules:
- Every field MUST have `.describe()` for Scalar docs
- Top-level schema MUST have `.describe()`
- Use `z.email()` not `z.string().email()` (Zod v4)
- Use `z.iso.datetime()` for timestamps
- Use `z.coerce.number()` for query params

### Step 5: Create the repository (if new table)

File: `src/modules/<module>/contexts/<context>/<tableName>.repository.ts`

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { BaseRepository } from '@shared/repositories';
import { DRIZZLE, DrizzleDatabase } from '@config/database/database.module';
import { <tableName>, <Item>, New<Item> } from '@config/database/schema';

@Injectable()
export class <Item>Repository extends BaseRepository<typeof <tableName>, <Item>> {
  constructor(@Inject(DRIZZLE) db: DrizzleDatabase) {
    super(db, <tableName>);
  }

  // Add custom query methods here
}
```

### Step 6: Create the service

File: `src/modules/<module>/contexts/<context>/<context>.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { <Item>Repository } from './<item>.repository';
import { Create<Item>RequestDto, <Item>ResponseDto } from './schemas/<context>.schema';

@Injectable()
export class Create<Item>Service {
  constructor(private readonly <item>Repository: <Item>Repository) {}

  async execute(dto: Create<Item>RequestDto): Promise<<Item>ResponseDto> {
    return this.<item>Repository.save(dto);
  }
}
```

### Step 7: Create the controller

File: `src/modules/<module>/contexts/<context>/<context>.controller.ts`

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { API_TAGS } from '@shared/constants';
import { Public } from '@shared/decorators';
import { Create<Item>Service } from './<context>.service';
import { Create<Item>RequestDto, <Item>ResponseDto } from './schemas/<context>.schema';

@ApiTags(API_TAGS.<MODULE>)
@Controller({ version: '1', path: '<context>' })
export class Create<Item>Controller {
  constructor(private readonly <context>Service: Create<Item>Service) {}

  @Post()
  @Public()  // Only if endpoint should bypass auth
  @ApiOperation({ summary: '...', description: '...' })
  @ApiBody({ type: Create<Item>RequestDto, description: '...' })
  @ZodResponse({ status: 200, description: '...', type: <Item>ResponseDto })
  async handle(@Body() data: Create<Item>RequestDto) {
    return this.<context>Service.execute(data);
  }
}
```

### Step 8: Wire the module

File: `src/modules/<module>/<module>.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@config/database/database.module';
import { Create<Item>Controller } from './contexts/<context>/<context>.controller';
import { Create<Item>Service } from './contexts/<context>/<context>.service';
import { <Item>Repository } from './contexts/<context>/<item>.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [Create<Item>Controller],
  providers: [Create<Item>Service, <Item>Repository],
})
export class <Module>Module {}
```

Register in `src/app.module.ts`:
```typescript
imports: [
  // ... existing modules
  <Module>Module,
]
```

### Step 9: Add API tag (if new domain)

File: `src/shared/constants/apiTags.ts`

```typescript
export const API_TAGS = {
  HEALTH: 'Health',
  AUTH: 'Auth',
  <MODULE>: '<Module>',
};
```

### Step 10: Write tests

File: `src/modules/<module>/contexts/<context>/tests/<context>.service.spec.ts`

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Create<Item>Service } from '../<context>.service';

describe('<Context>Service', () => {
  let service: Create<Item>Service;
  let <item>Repository: { save: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    <item>Repository = { save: vi.fn() };
    service = new Create<Item>Service(<item>Repository as never);
  });

  it('creates and returns the item', async () => {
    const dto = { /* valid data */ };
    const expected = { id: 'uuid', ...dto };
    <item>Repository.save.mockResolvedValue(expected);

    const result = await service.execute(dto);

    expect(result).toEqual(expected);
    expect(<item>Repository.save).toHaveBeenCalledWith(dto);
  });

  it('propagates repository errors', async () => {
    <item>Repository.save.mockRejectedValue(new Error('db error'));
    await expect(service.execute({} as any)).rejects.toThrow('db error');
  });
});
```

### Step 11: Verify

```bash
npm run lint
npm run test
```

## File Checklist

After scaffolding, verify these files exist:

- `src/config/database/schema/<table>.ts` (+ exported from index.ts)
- `src/modules/<module>/<module>.module.ts`
- `src/modules/<module>/contexts/<context>/<context>.controller.ts`
- `src/modules/<module>/contexts/<context>/<context>.service.ts`
- `src/modules/<module>/contexts/<context>/schemas/<context>.schema.ts`
- `src/modules/<module>/contexts/<context>/tests/<context>.service.spec.ts`
- `src/modules/<module>/contexts/<context>/<item>.repository.ts` (if needed)
- `src/shared/constants/apiTags.ts` updated (if new domain)
- `src/app.module.ts` updated with new module import
