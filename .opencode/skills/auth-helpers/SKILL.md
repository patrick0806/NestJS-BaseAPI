---
name: auth-helpers
description: Set up authentication guards, role-based access control, and JWT strategies for new endpoints in this NestJS project. Use when the user is adding authentication to endpoints, configuring role-based access, or creating new auth-related features.
---

# Auth Helpers Skill

## When to Use

The user is adding authentication to endpoints, configuring role-based access, or creating new auth-related features.

## How Auth Works in This Project

### Default: ALL Routes Protected

JWTAuthGuard is registered globally in `app.module.ts`:

```typescript
providers: [
  { provide: 'APP_GUARD', useClass: JWTAuthGuard },
  { provide: 'APP_GUARD', useClass: RolesGuard },
]
```

This means every endpoint requires a valid JWT Bearer token unless explicitly marked as public.

### Auth Flow

1. Client sends `Authorization: Bearer <jwt>` header
2. `JWTAuthGuard` intercepts the request
3. Checks for `@Public()` metadata — if present, skips auth
4. If not public, delegates to Passport's `jwt` strategy
5. `JwtStrategy.validate()` extracts `sub` (userId) and `email` from token
6. User object is attached to `request.user`
7. `RolesGuard` checks `@Roles()` metadata — if present, verifies user has required role

## Making an Endpoint Public

```typescript
import { Public } from '@shared/decorators';

@Controller({ version: '1', path: 'items' })
export class ItemsController {
  // This endpoint is PUBLIC — no auth required
  @Public()
  @Get('public')
  async getPublicItems() { ... }

  // This endpoint is PROTECTED — requires valid JWT
  @Get('private')
  async getPrivateItems() { ... }
}
```

`@Public()` can be applied to:
- A single handler method (most common)
- An entire controller class (all methods public)

## Adding Role-Based Access

### 1. Available Roles

Defined in `src/shared/enums/applicationRoles.enum.ts`:

```typescript
export enum ApplicationRoles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
```

Add new roles to this enum when needed.

### 2. Protect a Handler with Roles

```typescript
import { Roles } from '@shared/decorators';
import { ApplicationRoles } from '@shared/enums';

@Post()
@Roles(ApplicationRoles.ADMIN)
@ApiOperation({ summary: 'Create a resource (admin only)' })
async create(@Body() data: CreateItemRequestDto) { ... }
```

### 3. Multiple Roles

```typescript
@Get()
@Roles(ApplicationRoles.ADMIN, ApplicationRoles.USER)
@ApiOperation({ summary: 'List resources (any authenticated user)' })
async list() { ... }
```

### 4. How RolesGuard Works

From `src/shared/guards/roles.guard.ts`:

```typescript
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<ApplicationRoles[]>(
    ROLES_KEY, [context.getHandler(), context.getClass()],
  );
  if (!requiredRoles) return true;  // No @Roles() → allow everyone
  const { user } = context.switchToHttp().getRequest();
  return requiredRoles.some((role) => user.role === role);
}
```

**Important**: The current implementation checks `user.role` (singular). If your JWT payload stores roles differently, update this guard.

### 5. JWT Payload Shape

From `src/modules/auth/strategies/jwt.strategy.ts`:

```typescript
async validate(payload: any) {
  return { userId: payload.sub, username: payload.username };
}
```

The `request.user` object has: `{ userId, username }`.

To support roles, you need to:
1. Include `role` in the JWT sign payload (in `LoginService`)
2. Return it from `JwtStrategy.validate()`:
   ```typescript
   return { userId: payload.sub, email: payload.email, role: payload.role };
   ```
3. The `RolesGuard` will then find `user.role` correctly.

## Creating a New JWT Strategy

If you need a different token strategy (e.g., API keys, OAuth):

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '@config/env';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.API_KEY_SECRET,
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid API key');
    }
    return { userId: payload.sub };
  }
}
```

Register in module:
```typescript
providers: [ApiKeyStrategy]
```

Use with `@UseGuards(AuthGuard('api-key'))` on specific routes.

## Common Auth Patterns

### Public + Rate Limited

```typescript
@Public()
@Post('forgot-password')
@ApiOperation({ summary: 'Request password reset' })
async forgotPassword(@Body() data: ForgotPasswordDto) {
  // Rate limiting handled separately (middleware/interceptor)
  return this.authService.requestPasswordReset(data);
}
```

### Admin-Only Endpoint

```typescript
@Get('admin/users')
@Roles(ApplicationRoles.ADMIN)
@ApiOperation({ summary: 'List all users (admin)' })
async listAllUsers(@Query() query: PaginationDto) {
  return this.userService.listAll(query);
}
```

### User Can Only Access Own Data

```typescript
@Get('me')
@ApiOperation({ summary: 'Get current user profile' })
async getProfile(@Request() req) {
  // req.user.userId is set by JWT strategy
  return this.userService.findById(req.user.userId);
}
```

## Auth Token Endpoints

Already implemented in `src/modules/auth/`:

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/v1/login` | `@Public()` | Authenticate, get JWT + refresh token |
| `POST /api/v1/refresh` | `@Public()` | Exchange refresh token for new JWT |
| `POST /api/v1/logout` | `@Public()` | Revoke refresh token |

## Testing Auth

### Test a protected endpoint

```typescript
describe('ItemsController', () => {
  it('requires authentication', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/items');
    expect(response.status).toBe(401);
  });

  it('allows authenticated requests', async () => {
    const token = await getAuthToken(); // helper to login
    const response = await request(app.getHttpServer())
      .get('/api/v1/items')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
```

### Test role-based access

```typescript
it('rejects non-admin users', async () => {
  const userToken = await loginAs('user@example.com', 'password');
  const response = await request(app.getHttpServer())
    .get('/api/v1/admin/users')
    .set('Authorization', `Bearer ${userToken}`);
  expect(response.status).toBe(403);
});
```

## Security Reminders

1. Never store raw refresh tokens — always hash with `hashRefreshToken()` before storing
2. JWT secret must come from `env.JWT_SECRET`, never hardcoded
3. Refresh token rotation: old token is revoked, new token issued (already implemented)
4. Reuse detection: if a revoked refresh token is used, all tokens for that user are revoked
5. Passwords hashed with bcrypt via `hashPassword()` (salt rounds from `BCRYPT_SALT_ROUNDS` env)
