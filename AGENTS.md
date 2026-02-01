# Agent Guidelines for Garasi

This file contains guidelines for agentic coding assistants working in this repository.

## Essential Commands

### Development
```bash
bun run dev                # Start development server
bun run build              # Build for production (runs typecheck + vite build)
bun run start              # Start production server
```

### Code Quality
```bash
bun run typecheck          # Run TypeScript compiler checks (tsc -b --noEmit)
bun run lint               # Run oxlint with auto-fix
bun run format             # Format code with oxfmt
bun run check              # Check formatting and linting (oxfmt --check && oxlint)
```

## Project Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Routing:** TanStack Router (file-based routing in `app/routes/`)
- **State:** TanStack Query + Nanostores + nuqs (query parameters)
- **Styling:** Tailwind CSS v4
- **Backend:** Nitro (API endpoints in `server/api/`)
- **Database:** SQLite with Kysely query builder
- **Testing:** HTTL for API testing, Playwright for E2E
- **Runtime:** Bun

### Directory Structure
```
app/                     # Frontend React application
  ├── components/        # Reusable UI components
  ├── routes/            # TanStack Router file-based routes
  ├── services/          # Frontend API service functions
  ├── guards/            # Authentication guards/providers
  ├── hooks/             # Custom React hooks (use* prefix)
  ├── stores.ts          # Nanostores definitions
  └── utils.ts           # Utility functions (clx helper)
server/                  # Nitro backend API
  ├── api/               # API endpoints (route-method.ts pattern)
  ├── services/          # Business logic services
  ├── database/          # DB client, schema, migrations
  ├── platform/          # Platform utilities (jwt, mailer, logger)
  └── middleware/        # Nitro middleware
shared/                  # Shared between frontend and backend
  ├── schemas/           # TypeScript interfaces and types
  ├── envars/            # Environment variable schemas
  └── utils/             # Shared utilities
specs/                   # Yaak API requests (not for test)
```

## Code Style Guidelines

### Formatting Rules
- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes (`'`), double quotes for JSX attributes
- **Semicolons:** Omit semicolons
- **Line width:** 100 characters max (strict)
- **Line endings:** LF only
- **Trailing commas:** Never
- **Final newline:** Required
- **Import splitting:** Split long imports across multiple lines to stay within 100 chars

### Import Order
Imports are automatically sorted by oxfmt in this order:
1. Built-in and external packages (React, third-party libs)
2. Internal packages (`#/`, `~/` aliases)
3. Parent/sibling/index imports

Groups are separated, sorted alphabetically case-insensitive.

### TypeScript Configuration
- **Strict mode:** Enabled
- **Unused variables:** Not allowed (`noUnusedLocals`, `noUnusedParameters`)
- **Path aliases:** `~/*` maps to project root
- **Module syntax:** `verbatimModuleSyntax` (explicit type imports)

### Naming Conventions
- **Components:** kebab-case (`button.tsx`, `password-field.tsx`)
- **Functions:** camelCase (`signIn`, `logout`, `getUserSessions`)
- **Hooks:** camelCase with `use` prefix (`useAuth`, `useSidebar`)
- **Constants:** UPPER_SNAKE_CASE
- **Interfaces/Types:** PascalCase, descriptive suffixes (`UserTable`, `SignInParams` , `SignInRequest`, `SignInResponse`)
- **Files:** kebab-case for multi-word components (`input-password.tsx`)
- **Services:** lowercase with dots (`auth.service.ts`, `user.service.ts`)

### Component Guidelines
- Use functional components with hooks
- Destructure props in function signature
- Use `clx()` utility for conditional classes (merges clsx + tailwind-merge)
- Prefer `class-variance-authority` (cva) for component variants
- Use Base UI primitives (`@base-ui/react`) with custom styling
- Export component props as `VariantProps<typeof componentStyles>`

### Function Parameters
- Maximum 3 parameters per function
- If more than 3 parameters, use an object parameter
- Object parameter should be descriptive with `*Data`, `*Opts` or `*Options` suffix

```typescript
// Valid - 3 parameters or less
function signIn(email: string, password: string) {}
function createUser(name: string, email: string, isAdmin: boolean) {}

// Valid - more than 3 parameters, use object
interface CreateUserData {
  name: string
  email: string
  isAdmin: boolean
  department: string
  managerId: string
}
function createUser(opts: CreateUserData) {}

// Valid - mix of required params and options object
function authenticateUser(email: string, password: string, opts: AuthOpts) {}
```

### Import Examples
```typescript
// External packages
import { Button } from '@base-ui/react/button'
import * as React from 'react'

// Internal imports (~/ maps to root)
import { clx } from '~/app/utils'
import { useAuth } from '~/app/guards'

// Relative imports
import { Card } from './card'

// Split long type imports to stay within 100 characters
import type { SignInRequest, SignInResponse } from '~/shared/schemas/auth.schema'
import type { GetUserSessionsResponse, ValidateTokenParams } from '~/shared/schemas/auth.schema'
```

### Error Handling
- Throw `HTTPError` from `nitro/h3` in API endpoints
- Include status and statusText: `new HTTPError({ status: 400, statusText: 'Message' })`
- Use try/catch in service functions
- Return error responses via `createErrorResonse(event, error)`

### Logging Guidelines
- Use structured logging with `logger.withPrefix()` and `.withMetadata()`
- **IMPORTANT:** Do not destructure objects in `withMetadata()` - pass the object directly
- **INVALID:** `log.withMetadata({ data }).debug('message')` - creates nested structure
- **VALID:** `log.withMetadata(data).debug('message')` - flat structure
- **VALID:** `log.withMetadata({ ...data, etc }).debug('message')` - spread with additional fields
- **Redacted data:** Sensitive data is automatically redacted, no manual trimming/censoring needed

**Log Level Usage by Layer:**
- **Handler/Transport Layer:** All levels available (`info`, `warn`, `error`, `debug`, `trace`, `fatal`)
- **Service/Repository Layer:** Use `error`, `debug`, and `trace` only

```typescript
// Invalid - creates unwanted nesting
const data = { userId: '123', email: 'user@example.com' }
log.withMetadata({ data }).debug('User created')
// Output: { data: { userId: '123', email: 'user@example.com' } }

// Valid - flat structure (sensitive data auto-redacted)
const data = { userId: '123', email: 'user@example.com' }
log.withMetadata(data).debug('User created')
// Output: { userId: '123', email: '***@***.***' }

// Valid - spread with additional fields (no manual redaction needed)
const data = { userId: '123', token: 'eyJhbGc...' }
log.withMetadata({ ...data, action: 'signin' }).debug('User signed in')
// Output: { userId: '123', token: '***REDACTED***', action: 'signin' }

// Handler/Transport Layer examples - all log levels available
log.info('User signed in successfully')
log.warn('Rate limit exceeded for IP')
log.withMetadata(error).error('Authentication failed')
log.debug('Processing request')
log.trace('Detailed request flow')
log.fatal('Critical system error')

// Service/Repository Layer examples - only error, debug, trace
log.withMetadata({ userId }).error('Database query failed')
log.withMetadata(params).debug('Executing user lookup')
log.withMetadata({ query, result }).trace('Query execution details')
```

### API Endpoint Structure
```typescript
// server/api/auth/signin.post.ts
import { defineHandler, readBody } from 'nitro/h3'
import { createResponse, createErrorResonse } from '~/server/platform/responder'
import type { SignInRequest, SignInResponse } from '~/shared/schemas/auth.schema'

export default defineHandler(async (event) => {
  const { db, logger } = event.context
  const log = logger.withPrefix('auth:signin')

  try {
    const body = await readBody<SignInRequest>(event)
    // ... logic
    return createResponse<SignInResponse>(event, 'Success message', {
      statusCode: 201,
      data: {
        user_id: user.id,
        email: user.email,
        name: user.name,
        session_id: sessionId,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        access_token_expiry: tokens.accessTokenExpiry,
        refresh_token_expiry: tokens.refreshTokenExpiry
      }
    })
  } catch (error) {
    return createErrorResonse(event, error)
  }
})

// GET endpoint with query parameters (type-safe)
// server/api/auth/validate-token.get.ts
import { defineHandler, getQuery, HTTPError } from 'h3'
import { createResponse, createErrorResonse } from '~/server/platform/responder'
import type { ValidateTokenParams } from '~/shared/schemas/auth.schema'

export default defineHandler(async (event) => {
  const { db, logger } = event.context
  const log = logger.withPrefix('auth:validate-token')

  try {
    const { token } = getQuery<ValidateTokenParams>(event)

    if (!token || token.trim() === '') {
      throw new HTTPError({ status: 400, statusText: 'Token is required' })
    }

    log.withMetadata({ token }).debug('Validating password reset token')

    // ... logic

    return createResponse(event, 'Token valid', {
      data: { is_token_valid: true }
    })
  } catch (error) {
    return createErrorResonse(event, error)
  }
})

// No need try-catch inside protected handler
// server/api/auth/sessions/index.get.ts
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { getUserSessions } from '~/server/services/session.service'
import type { GetUserSessionsResponse } from '~/shared/schemas/auth.schema'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context
  const log = logger.withPrefix('auth:sessions:get')

  const sessions = await getUserSessions(db, auth.userId)

  log
    .withMetadata({ userId: auth.userId, sessionCount: sessions.length })
    .debug('User sessions retrieved')

  const data: GetUserSessionsResponse = {
      sessions: sessions.map((session) => ({
        id: session.id,
        ip_address: session.ipAddress,
        device_info: session.deviceInfo,
        last_activity_at: session.lastActivityAt,
        expires_at: session.expiresAt,
        created_at: session.createdAt,
        is_current: session.id === auth.sessionId
      }))
  }

  return createResponse<GetUserSessionsResponse>(event, 'Sessions retrieved successfully', { data })
})
```

### Frontend API Services (app/services)
Frontend API calls should be created in `app/services/` directory. Use the `fetcher` utility with response type generics and import contract types from `shared/schemas`.

```typescript
// app/services/auth.service.ts
import { fetcher } from '~/app/fetcher'
import type { GetUserSessionsResponse, ValidateTokenParams } from '~/shared/schemas/auth.schema'
import type { SignInRequest, SignInResponse } from '~/shared/schemas/auth.schema'

export async function signin(email: string, password: string) {
  const body: SignInRequest = { email, password }
  return await fetcher<SignInResponse>('/auth/signin', {
    method: 'POST',
    body
  })
}

export async function validateToken(token: string) {
  const params: ValidateTokenParams = { token }
  return await fetcher('/auth/validate-token', {
    method: 'GET',
    query: params
  })
}

export async function getUserSessions() {
  return await fetcher<GetUserSessionsResponse>('/auth/sessions', {
    method: 'GET'
  })
}
```

Usage in TanStack Query:
```typescript
// app/routes/auth/signin.tsx
import { useMutation } from '@tanstack/react-query'
import { signin } from '~/app/services/auth.service'

const mutation = useMutation({
  mutationFn: ({ email, password }: SignInRequest) => signin(email, password)
})
```

### TanStack Router Loaders
Prefetch TanStack Query data in TanStack Router loader to ensure data is in cache before render. Use `context.queryClient.ensureQueryData()` for multiple queries.

```typescript
// app/routes/(app)/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { abcFetch, defFetch } from '~/app/services/abc.service'

const abcQuery = queryOptions({
  queryKey: ['healthCheck'],
  queryFn: abcFetch
})

const defQuery = queryOptions({
  queryKey: ['healthCheck'],
  queryFn: defFetch
})

export const Route = createFileRoute('/(app)/')({
  component: IndexComponent,
  loader: ({ context }) => {
    // Ensure the data is in the cache before render
    context.queryClient.ensureQueryData(abcQuery)
    context.queryClient.ensureQueryData(defQuery)
  }
})

function IndexComponent() {
  // Data is already cached, no loading state
  const abc = useSuspenseQuery(abcQuery)
  const def = useSuspenseQuery(defQuery)
  // ...
}
```

**TanStack Router Hooks:**
```typescript
const ctx = Route.useRouteContext()
const params = Route.useParams()
const loaderData = Route.useLoaderData()
const navigate = Route.useNavigate()
const search = Route.useSearch()
```

### Form Handling
Use TanStack Form with `Form` component from `app/components` and Zod for validation. See example integration in `app/routes/(auth)/signin.tsx`.

```typescript
// app/routes/(auth)/signin.tsx
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Form } from '~/app/components/form'
import { Field, FieldLabel, FieldError } from '~/app/components/field'
import { Input } from '~/app/components/input'
import { Button } from '~/app/components/button'

const signinSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' }),
  remember: z.boolean()
})

export const Route = createFileRoute('/(auth)/signin')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  const form = useForm({
    defaultValues: { email: '', password: '', remember: false },
    validators: { onChange: signinSchema },
    onSubmit: async ({ value }) => {
      // Submit logic
      navigate({ to: '/' })
    }
  })

  return (
    <Form onSubmit={form.handleSubmit}>
      <form.Field name='email'>
        {(field) => (
          <Field>
            <FieldLabel>Email address</FieldLabel>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError>{field.state.meta.errors}</FieldError>
          </Field>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type='submit' disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        )}
      </form.Subscribe>
    </Form>
  )
}
```

**UI Component Examples:**
- See Storybook stories in `stories/` directory for UI component examples
- Run `bun run storybook` to view interactive component examples

### Database Operations
- Use Kysely query builder with type-safe schema
- All table schemas defined in `server/database/schemas/`
- Migrations are SQL files in `server/database/migrations/`
- Access via `event.context.db` in Nitro handlers

### Testing Guidelines
**NOTE:** Ignore HTTL and E2E testing for now. Focus on API contracts and frontend integration first.

### API Contract Types (shared/schemas)
The `shared/schemas/` folder contains TypeScript interfaces for API contracts:
- **Request types:** API request body contracts (e.g., `SignInRequest`, `ChangePasswordRequest`)
- **Response types:** API response contracts (e.g., `SignInResponse`, `GetUserSessionsResponse`)
- **Params types:** Query parameter contracts (e.g., `ValidateTokenParams`, `RevokeSessionParams`)

All contracts should follow this naming pattern:
- `*Request` - Request body for POST/PUT/PATCH endpoints
- `*Response` - Response data structure
- `*Params` - URL/query parameters for GET/DELETE endpoints

Example contract structure:
```typescript
// shared/schemas/auth.schema.ts
export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse {
  user_id: string
  email: string
  name: string
  session_id: string
  access_token: string
  refresh_token: string
  access_token_expiry: number
  refresh_token_expiry: number
}

export interface ValidateTokenParams {
  token: string
}
```

### File-Specific Rules
- **Generated files:** Mark as readonly in `.vscode/settings.json`
  - `routes.gen.ts`, `routeTree.gen.ts`
- **Storybook:** Run `bun run storybook` for component development
- **Docker:** Use `bun run compose:up` for development stack

### Paths and Aliases
- `~/` - Project root (configured in tsconfig)
- `#/` - Internal packages (if configured)
- Use these for imports to avoid relative path hell

### Additional Notes
- The project uses JWT for authentication with access/refresh tokens
- Sessions are tracked with IP and user agent
- All environment variables are validated in `shared/envars/`
- Logger uses structured logging with loglayer
- Component styling uses Tailwind CSS v4 with CSS variables for theming
- TanStack Router requires file-based routing with proper bracket syntax for params

## Before Committing
Always run these commands:
```bash
bun run format      # Execute code formatting
bun run typecheck   # Ensure no TypeScript errors
bun run lint        # Fix linting issues
bun run check       # Final check before commit
```

This ensures code quality and type safety across the codebase.
