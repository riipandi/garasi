# Authentication Guide

This guide explains how to use the authentication middleware and helpers in your protected routes.

## Overview

The authentication system in `server/platform/guards.ts` provides:

- **`authenticateRequest(event)`**: Core function that validates JWT tokens and sessions
- **`authMiddleware()`**: Global middleware for Nitro
- **`defineProtectedHandler(handler)`**: Helper to wrap individual route handlers with authentication

## Using `defineProtectedHandler` for Protected Routes

The `defineProtectedHandler` helper is the recommended way to protect individual routes. It automatically:
1. Validates the JWT access token from the `Authorization` header
2. Validates the session ID from the token payload
3. Updates session activity
4. Attaches authenticated user data to `event.context.auth`

### Basic Example

```typescript
import { defineHandler, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

// Protect a simple GET route
export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  // Access authenticated user data
  const { userId, sessionId } = auth

  // Fetch user data
  const user = await db
    .selectFrom('users')
    .select(['id', 'email', 'name'])
    .where('id', '=', userId)
    .executeTakeFirst()

  return {
    success: true,
    data: { user }
  }
})
```

### POST Request Example

```typescript
import { defineHandler, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  // Get request body
  const body = await readBody(event)

  // Access authenticated user data
  const { userId } = auth

  // Perform action on behalf of user
  const result = await db
    .insertInto('user_settings')
    .values({
      user_id: userId,
      key: body.key,
      value: body.value
    })
    .executeTakeFirst()

  return {
    success: true,
    data: { id: result.insertId }
  }
})
```

### Error Handling

The `defineProtectedHandler` helper automatically throws appropriate errors:

- **401 Unauthorized**: Missing or invalid `Authorization` header
- **401 Unauthorized**: Invalid or expired JWT token
- **401 Unauthorized**: Missing session ID in token
- **401 Unauthorized**: Invalid or expired session
- **403 Forbidden**: Session doesn't belong to the user

You can handle these errors in your route:

```typescript
import { defineProtectedHandler } from '~/server/platform/guards'
import { HTTPError } from 'nitro/h3'

export default defineProtectedHandler(async (event) => {
  try {
    const { auth } = event.context

    // Your route logic here
    return { success: true }

  } catch (error) {
    if (error instanceof HTTPError) {
      // Authentication errors are already handled
      throw error
    }

    // Handle other errors
    event.res.status = 500
    return { success: false, message: 'Internal server error' }
  }
})
```

## Using `authenticateRequest` Directly

If you need more control, you can call `authenticateRequest` directly:

```typescript
import { defineHandler } from 'nitro/h3'
import { authenticateRequest } from '~/server/platform/guards'

export default defineHandler(async (event) => {
  // Manually authenticate
  const auth = await authenticateRequest(event)

  // Access authenticated user data
  const { userId, sessionId } = auth

  // Your route logic here
  return { success: true, userId }
})
```

## Using `authMiddleware` Globally

To apply authentication to all routes, create a middleware file in `server/middleware/`:

```typescript
// server/middleware/auth.ts
import { authMiddleware } from '~/server/platform/guards'

export default authMiddleware()
```

**Note**: This will protect ALL routes. To exclude public routes, you can add conditional logic:

```typescript
// server/middleware/auth.ts
import { authMiddleware } from '~/server/platform/guards'
import { getRequestURL } from 'nitro/h3'

export default defineHandler(async (event) => {
  const url = getRequestURL(event)

  // Skip authentication for public routes
  const publicRoutes = ['/api/auth/signin', '/api/auth/refresh']
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))

  if (!isPublicRoute) {
    // Apply authentication
    const authMiddlewareFn = authMiddleware()
    await authMiddlewareFn(event)
  }
})
```

## Accessing Authenticated User Data

After authentication, the user data is available in `event.context.auth`:

```typescript
interface AuthenticatedEvent {
  userId: string      // The authenticated user's ID
  sessionId: string   // The current session ID
}
```

### Example: Accessing User ID

```typescript
export default defineProtectedHandler(async (event) => {
  const { auth } = event.context
  const { userId } = auth

  // Use userId in your queries
  const data = await db
    .selectFrom('items')
    .where('user_id', '=', userId)
    .execute()

  return { success: true, data }
})
```

## JWT Token Requirements

The JWT access token must include:

- **`sub`**: User ID (required)
- **`sid`**: Session ID (required)

Example token payload:
```json
{
  "sub": "123",
  "sid": "abc-123-def-456",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Best Practices

1. **Always use `defineProtectedHandler`** for protected routes - it's the simplest and safest approach
2. **Access user data from `event.context.auth`** - don't re-authenticate manually
3. **Handle errors appropriately** - authentication errors are already thrown with proper status codes
4. **Validate user permissions** - after authentication, check if the user has permission to perform the action
5. **Use the session ID** for tracking user sessions and activities

## Complete Example: Protected CRUD Route

```typescript
import { defineProtectedHandler } from '~/server/platform/guards'
import { HTTPError } from 'nitro/h3'

// GET /api/posts - List user's posts
export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context
  const { userId } = auth

  const posts = await db
    .selectFrom('posts')
    .selectAll()
    .where('user_id', '=', userId)
    .execute()

  return {
    success: true,
    data: { posts }
  }
})

// POST /api/posts - Create a new post
export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context
  const { userId } = auth
  const body = await readBody(event)

  const post = await db
    .insertInto('posts')
    .values({
      user_id: userId,
      title: body.title,
      content: body.content
    })
    .executeTakeFirst()

  return {
    success: true,
    data: { id: post.insertId }
  }
})
```
