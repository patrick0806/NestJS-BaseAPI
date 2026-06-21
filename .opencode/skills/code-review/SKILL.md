---
name: code-review
description: Review code changes for project conventions, security issues, NestJS best practices, and consistency with existing patterns. Use when the user wants to review code, check a PR, or audit existing code for quality.
---

# Code Review Skill

## When to Use

The user wants to review code — either their own changes, a PR, or existing code for quality.

## Review Checklist

### 1. Module Structure

- Each context has its own folder under `contexts/`
- Controller, service, schemas, tests are all present
- Module file wires everything correctly
- Module is registered in `app.module.ts`
- Barrel exports (index.ts) exist in all directories

### 2. Auth & Security

- Protected endpoints do NOT have `@Public()`
- Public endpoints DO have `@Public()`
- Role-restricted endpoints use `@Roles(ApplicationRoles.XXX)`
- No hardcoded secrets, passwords, or tokens
- Refresh tokens stored as hashes only (SHA-256 via `hashRefreshToken()`)
- Passwords hashed with bcrypt (via `hashPassword()`)
- JWT secret loaded from `env.JWT_SECRET`, not hardcoded

### 3. Database

- New tables extend `...baseEntity`
- DB column names are snake_case
- TypeScript property names are camelCase
- Foreign keys use `.references(() => table.id, { onDelete: 'cascade' })`
- Indexes defined for FK columns and frequently queried fields
- Schema exported from `src/config/database/schema/index.ts`
- Migration generated with `npm run db:generate`

### 4. Validation (Zod)

- Using Zod v4 API: `z.email()`, `z.uuid()`, `z.iso.datetime()`
- NOT using class-validator anywhere
- Every field has `.describe()`
- Top-level schema has `.describe()`
- DTOs created with `createZodDto()`
- No `@ApiProperty()` decorators on Zod DTOs (conflicts with nestjs-zod)

### 5. Controller Conventions

- Versioned: `@Controller({ version: '1', path: '...' })`
- Tagged: `@ApiTags(API_TAGS.XXX)`
- `@ApiOperation()` with summary and description
- `@ApiBody()` or `@ApiQuery()` with type and description
- `@ZodResponse()` for Zod-based response documentation
- Handler method is `async` and returns a DTO

### 6. Service Conventions

- Service is `@Injectable()`
- Constructor injection (no `new` for dependencies)
- Business logic in service, not controller
- Repository used for data access, not raw Drizzle queries in service
- Errors thrown as NestJS exceptions (`UnauthorizedException`, `NotFoundException`, etc.)
- No `console.log()` — use `LogBuilderService` if logging needed

### 7. Repository Conventions

- Extends `BaseRepository<TTable, TSelect, TInsert>`
- Injected with `@Inject(DRIZZLE) db: DrizzleDatabase`
- Custom queries added as methods on the repository class
- No raw SQL unless Drizzle builder can't express it

### 8. Imports & Path Aliases

- All cross-directory imports use path aliases (`@config/*`, `@modules/*`, `@shared/*`)
- No `../../` relative imports across directories
- Import ordering follows ESLint config: @config → @shared → @modules → relative
- No unused imports

### 9. Testing

- Test file at `tests/<context>.service.spec.ts`
- Uses Vitest: `import { describe, expect, it, vi, beforeEach } from 'vitest'`
- Mocks shared utilities with `vi.mock()`
- Manual constructor injection with mock objects
- `beforeEach(() => vi.clearAllMocks())`
- Tests cover: happy path + error paths
- Error assertions use `rejects.toMatchObject({ status: N })` or `rejects.toThrow()`

### 10. Code Style

- No comments (unless user explicitly asks)
- snake_case DB columns, camelCase TS variables
- No `any` types unless justified (ESLint allows it but prefer types)
- No `console.log()` — use LogBuilderService or remove
- Consistent naming: `<Context>Controller`, `<Context>Service`, `<Context>Schema`

## Security Red Flags

Flag these immediately:

- Hardcoded credentials or secrets
- SQL injection risks (raw query with user input)
- Missing authentication on sensitive endpoints
- Refresh token stored in plain text
- Password returned in API responses
- Missing input validation
- Overly permissive CORS
- Sensitive data in logs

## Performance Red Flags

- N+1 queries (fetching related data in loops)
- Missing database indexes on frequently queried columns
- Large payloads without pagination
- Synchronous file I/O in request handlers
- Missing `returning()` on insert/update when result is needed

## Report Format

```markdown
## Code Review: <description>

### Summary
<Brief overview of changes>

### Issues Found
<list of issues with severity: critical/warning/info>

### Suggestions
<optional improvements>

### Files Reviewed
<list of files>
```
