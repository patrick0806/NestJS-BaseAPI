---
name: validation-patterns
description: Guide for creating Zod v4 schemas, DTOs, and OpenAPI documentation in this NestJS project using nestjs-zod. Use when the user is creating or modifying Zod schemas, request/response DTOs, or wants to understand how validation works.
---

# Validation Patterns Skill

## When to Use

The user is creating or modifying Zod schemas, request/response DTOs, or wants to understand how validation works in this project.

## Core Rules

1. **NEVER use class-validator** — this project uses Zod exclusively
2. **Every field MUST have `.describe()`** — for Scalar API Reference docs
3. **Top-level schema MUST have `.describe()`** — shows as schema description in Scalar
4. **Use `createZodDto()`** from `nestjs-zod` — wraps Zod schemas into NestJS-compatible DTO classes

## Schema + DTO Pattern

```typescript
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// 1. Define the Zod schema
export const CreateUserSchema = z.object({
  email: z
    .email()
    .describe("User's email address. Must be unique across the users table."),
  password: z
    .string()
    .min(8)
    .max(128)
    .describe('Plain-text password. Will be hashed with bcrypt before persisting.'),
  name: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("User's display name. Optional."),
}).describe('Payload to create a new user account.');

// 2. Create the DTO class
export class CreateUserRequestDto extends createZodDto(CreateUserSchema) {}
```

## Zod v4 API Reference

This project uses **Zod v4** (not v3). Key differences:

| Purpose | Zod v3 (DON'T) | Zod v4 (DO) |
|---------|-----------------|-------------|
| Email | `z.string().email()` | `z.email()` |
| ISO datetime | `z.string().datetime()` | `z.iso.datetime()` |
| UUID | `z.string().uuid()` | `z.uuid()` |
| URL | `z.string().url()` | `z.url()` |
| Coerce number | `z.coerce.number()` | `z.coerce.number()` (same) |

## Common Patterns

### Request DTO (input validation)

```typescript
export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).describe('New display name'),
  email: z.email().describe('New email address'),
}).describe('Payload to update user fields. All fields are optional.');

export class UpdateUserRequestDto extends createZodDto(UpdateUserSchema) {}
```

### Response DTO (output shape)

```typescript
export const UserResponseSchema = z.object({
  id: z.uuid().describe('Unique user identifier'),
  email: z.email().describe('User email'),
  name: z.string().describe('Display name'),
  createdAt: z.iso.datetime().describe('Account creation timestamp'),
}).describe('User resource returned by the API.');

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
```

### Pagination (use shared schema)

```typescript
import { PaginationSchema, PaginatedResponseSchema } from '@shared/dtos';

// Query params: ?page=1&pageSize=10
export const ListUsersQuerySchema = PaginationSchema;
export class ListUsersQueryDto extends createZodDto(ListUsersQuerySchema) {}

// Response: { page, pageSize, totalElements, totalPages, content: [...] }
export const ListUsersResponseSchema = PaginatedResponseSchema(UserResponseSchema);
export class ListUsersResponseDto extends createZodDto(ListUsersResponseSchema) {}
```

### Enum fields

```typescript
export const CreateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped']).describe('Order status'),
}).describe('Create a new order.');
```

### Nested objects

```typescript
export const CreateProductSchema = z.object({
  name: z.string().min(1).describe('Product name'),
  price: z.number().positive().describe('Price in cents'),
  variants: z.array(z.object({
    size: z.string().describe('Size label'),
    stock: z.number().int().nonnegative().describe('Available stock'),
  })).describe('Available product variants'),
}).describe('Create a product with variants.');
```

### Optional / nullable fields

```typescript
z.string().optional()        // field can be omitted
z.string().nullable()        // field can be null
z.string().optional().nullable() // either
```

## Controller Decorators

Every controller method SHOULD have:

```typescript
@Post()
@ApiOperation({ summary: 'Short name', description: 'Detailed explanation' })
@ApiBody({ type: CreateUserRequestDto, description: 'What this payload contains' })
@ZodResponse({ status: 201, description: 'Created successfully', type: UserResponseDto })
async create(@Body() data: CreateUserRequestDto) { ... }
```

### Response decorator options

- `@ZodResponse({ status: 200, type: ResponseDto })` — for Zod-based responses
- `@ApiResponse({ status: 404, description: 'Not found' })` — for error cases
- `@ApiBearerAuth()` — on protected endpoints (or omit since global auth applies)

## Validation Flow

1. Request arrives at controller
2. Global `ZodValidationPipe` (registered in `app.module.ts`) validates `@Body()` / `@Query()`
3. On failure: throws `ValidationException` with field-level errors
4. `ValidationExceptionFilter` catches it → returns `ExceptionDTO` with 400 status
5. On success: validated (and stripped of extra fields) data is passed to the handler

## Testing Schemas

```typescript
import { describe, expect, it } from 'vitest';
import { CreateUserSchema } from './user.schema';

describe('CreateUserSchema', () => {
  it('accepts valid input', () => {
    const result = CreateUserSchema.safeParse({
      email: 'test@example.com',
      password: 'validpassword',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = CreateUserSchema.safeParse({
      email: 'not-an-email',
      password: 'validpassword',
    });
    expect(result.success).toBe(false);
  });

  it('strips unknown fields', () => {
    const result = CreateUserSchema.safeParse({
      email: 'test@example.com',
      password: 'validpassword',
      unknownField: 'should be stripped',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('unknownField');
    }
  });
});
```

## Common Mistakes to Avoid

1. Using `z.string().email()` instead of `z.email()` (v3 vs v4)
2. Forgetting `.describe()` on fields — docs will be blank in Scalar
3. Forgetting `.describe()` on the top-level schema
4. Using class-validator decorators (`@IsEmail()`, etc.) — will not work
5. Not wrapping with `createZodDto()` — controller decorators need a class type
6. Adding OpenAPI decorators (`@ApiProperty`) on Zod DTOs — unnecessary and conflicts
