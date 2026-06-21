# AGENTS.md

## Project Overview

NestJS 11 skeleton API template. Fastify adapter, Drizzle ORM + PostgreSQL,
Zod v4 validation (no class-validator). Designed to be cloned and extended
with business logic.

## Runtime & Tooling

- Node >= 24, npm
- SWC compiler (not tsc for builds)
- Vitest for tests (SWC transform via unplugin-swc)
- ESLint flat config + Prettier
- Scalar API Reference at /api/docs (not Swagger UI)

## Path Aliases

All imports use these aliases — never relative paths for cross-directory:

- `@config/*` → `src/config/*`
- `@modules/*` → `src/modules/*`
- `@shared/*` → `src/shared/*`

ESLint enforces import ordering: @config → @shared → @modules → relative.

## Architecture

### Module Structure

Every module lives at `src/modules/<name>/` with:

```
modules/<name>/
  <name>.module.ts
  contexts/
    <context>/
      <context>.controller.ts
      <context>.service.ts
      schemas/
        <context>.schema.ts
      dtos/
        request.dto.ts
        response.dto.ts
      tests/
        <context>.service.spec.ts
```

A "context" is a single use-case (e.g., login, list-users, create-order).
Each context has its own controller + service. The module wires them together.

### Controllers

- Always versioned: `@Controller({ version: '1', path: '<context>' })`
- Always tagged: `@ApiTags(API_TAGS.<MODULE>)` (add new tags to `src/shared/constants/apiTags.ts`)
- Use `@ZodResponse()` for response docs, `@ApiBody()` for request docs
- Global `ZodValidationPipe` validates `@Body()` / `@Query()` automatically
- Global `ZodSerializerInterceptor` shapes responses

### Auth

- ALL routes protected by default (JWTAuthGuard registered as APP_GUARD)
- Public endpoints: `@Public()` on controller or handler
- Role-restricted: `@Roles(ApplicationRoles.ADMIN)` on handler
- JWT strategy extracts `sub` and `email` from token payload
- Refresh tokens stored as SHA-256 hashes, never raw

### Database

- Drizzle ORM with postgres.js driver
- All tables extend `baseEntity` (id UUID, createdAt, updatedAt)
- DB columns are snake_case; Drizzle config sets `casing: 'snake_case'`
- TypeScript properties are camelCase
- Schema files: `src/config/database/schema/<tableName>.ts`
- Barrel export: `src/config/database/schema/index.ts`
- Generated Zod schemas via `drizzle-zod`: `createInsertSchema()` / `createSelectSchema()`

### Repository Pattern

- Base: `BaseRepository<TTable, TSelect, TInsert>` in `@shared/repositories`
- Methods: `findById`, `list` (paginated), `save`, `update`, `delete`
- Extend with custom queries in module-scoped repositories
- Inject via `@Inject(DRIZZLE) db: DrizzleDatabase`

### Validation (Zod v4)

- NEVER use class-validator — this project uses Zod exclusively
- Schema definition: `z.object({ ... }).describe('...')`
- DTO class: `class FooDto extends createZodDto(FooSchema) {}`
- Use `.describe()` on every property and on the top-level schema
- `z.email()` for email (Zod v4 API), `z.iso.datetime()` for ISO strings
- `z.coerce.number()` for query params that arrive as strings

### Error Handling

- `ValidationExceptionFilter` catches Zod errors → 400 with field-level details
- `HttpExceptionFilter` catches NestJS HttpExceptions → standardized ExceptionDTO
- Never throw raw `HttpException` — use NestJS built-in exceptions
- Error response shape: `{ timestamp, status, error, path, transactionId, message, details? }`

### Testing

- Vitest + SWC, files: `src/**/*.spec.ts`
- Manual constructor injection with vi.fn() mocks (no TestModule)
- `vi.mock()` for shared utilities
- Run: `npm run test` (CI runs this on push to main)
- Pattern: `beforeEach(() => vi.clearAllMocks())`

## Code Style Rules

- snake_case for DB columns, camelCase for everything in TS
- No comments unless the user explicitly asks
- No unused imports — ESLint errors on unused vars (prefix with `_` if intentional)
- Path aliases mandatory — no `../../` relative imports across directories
- One context per folder — don't combine unrelated operations
- Export barrel files from every directory (index.ts)

## Conventions for New Code

When adding a new module or feature:

1. Add schema to `src/config/database/schema/<table>.ts` + export from index
2. Run `npm run db:generate` to create migration
3. Create module at `src/modules/<name>/`
4. Register module in `src/app.module.ts`
5. Add API tag to `src/shared/constants/apiTags.ts` if new domain
6. Write tests alongside the service: `tests/<context>.service.spec.ts`
7. Never modify shared code (base.repository, guards, filters) without justification
