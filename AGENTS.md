# Agent Guidelines for Garasi

Guidelines for agentic coding assistants working in this repository.

## Essential Commands

### Development
```bash
bun run dev                # Start development server
bun run build              # Build for production (typecheck + vite build)
bun run start              # Start production server
```

### Testing
```bash
bun run storybook          # Run Storybook for component development
```

### Code Quality
```bash
bun run typecheck          # TypeScript compiler checks
bun run lint               # Run oxlint with auto-fix
bun run format             # Format code with oxfmt
bun run check              # Check formatting and linting
```

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Routing:** TanStack Router (file-based in `app/routes/`)
- **State:** TanStack Query + Nanostores + nuqs
- **Backend:** Nitro (API in `server/api/`)
- **Database:** SQLite with Kysely
- **Runtime:** Bun

## Code Style

### Formatting
- 2 spaces, no tabs
- Single quotes, double for JSX
- No semicolons, no trailing commas
- 100 chars max per line
- Use `oxfmt` for formatting

### Imports
```typescript
// External
import { Button } from '@base-ui/react/button'
// Internal (~ maps to root)
import { clx } from '~/app/utils'
// Relative
import { Card } from './card'
```

### TypeScript
- Strict mode enabled
- Explicit type imports (`verbatimModuleSyntax`)
- Path alias: `~/*` = project root
- Max 3 params per function; use object for more

### Naming
- Components: kebab-case (`button.tsx`)
- Functions: camelCase
- Hooks: `use*` prefix
- Constants: UPPER_SNAKE_CASE
- Types: PascalCase with `*Request`, `*Response`, `*Params` suffixes

### Components
- Functional with hooks
- Destructure props
- Use `clx()` for conditional classes
- Use `cva` for variants
- Base UI primitives with custom styling

### Error Handling
- Throw `HTTPError` from `nitro/h3`: `new HTTPError({ status: 400, statusText: 'Message' })`
- Use try/catch in services
- Return via `createErrorResonse(event, error)`

### Logging
```typescript
// Valid - flat structure
log.withMetadata(data).debug('message')

// Handler layer: info, warn, error, debug, trace, fatal
// Service layer: error, debug, trace only
```

## API Endpoints

Pattern: `server/api/{resource}/{method}.ts`

```typescript
// server/api/auth/signin.post.ts
import { defineHandler, readBody } from 'nitro/h3'
import { createResponse, createErrorResonse } from '~/server/platform/responder'

export default defineHandler(async (event) => {
  const { db, logger } = event.context
  const log = logger.withPrefix('auth:signin')

  try {
    const body = await readBody(event)
    // ... logic
    return createResponse(event, 'Success', { data: { user_id: '...' } })
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
```

Protected routes use `defineProtectedHandler` - no try/catch needed.

## Frontend Services

```typescript
// app/services/auth.service.ts
import { fetcher } from '~/app/fetcher'
import type { SigninResponse, WhoamiResponse } from '~/shared/schemas/user.schema'

export interface AuthService {
  signin: (email: string, password: string) => Promise<SigninResponse>
}

function defineAuthService(): AuthService {
  return {
    async signin(email: string, password: string) {
      return await fetcher<SigninResponse>('/auth/signin', {
        method: 'POST',
        body: { email, password }
      })
    }
  }
}

const authService = defineAuthService()
export default authService

```

## TanStack Router
- Loaders prefetch with `context.queryClient.ensureQueryData()`
- Use `useSuspenseQuery` for cached data

## Before Committing
```bash
bun run format && bun run typecheck && bun run lint && bun run check
```

## Important Notes
- **NEVER commit secrets** - Never add `.env` files or credentials to git
- **Run `bun run typecheck`** after making changes
- **Run `bun run format`** before committing code
- Don't use `try catch` with `defineProtectedHandler` - errors are handled automatically
- Access `event.context.db`, `event.context.auth`, `event.context.logger` in handlers
- Log only actionable information.
