import { defineHandler, HTTPError } from 'nitro/h3'
import type { EventHandlerRequest, EventHandlerResponse, H3Event } from 'nitro/h3'
import { verifyAccessToken } from '~/server/platform/jwt'
import { getSessionById, updateSessionActivity } from '~/server/services/session.service'
import { createErrorResonse } from './responder'

interface AuthenticatedEvent {
  userId: string
  sessionId: string
}

/**
 * Middleware to authenticate requests using JWT access tokens
 * and validate sessions
 *
 * @param event - H3 event object
 * @returns Authenticated user data
 */
export async function authenticateRequest(event: H3Event): Promise<AuthenticatedEvent> {
  const { db } = event.context

  // Get Authorization header
  const authHeader = event.req.headers.get('authorization')

  // Validate Authorization header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPError({
      status: 401,
      statusText: 'Unauthorized: Missing or invalid Authorization header'
    })
  }

  // Extract token from Authorization header
  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Verify the access token
  const payload = await verifyAccessToken(token)

  // Get user ID from token payload (sub claim)
  const userId = payload.sub

  if (!userId) {
    throw new HTTPError({ status: 401, statusText: 'Unauthorized: Invalid token payload' })
  }

  const sessionId = payload.sid

  if (!sessionId) {
    throw new HTTPError({ status: 401, statusText: 'Unauthorized: Session ID is required' })
  }

  // Get session from database
  const session = await getSessionById(db, sessionId)

  if (!session) {
    throw new HTTPError({ status: 401, statusText: 'Unauthorized: Invalid or expired session' })
  }

  // Verify session belongs to the user
  if (session.userId !== userId) {
    throw new HTTPError({ status: 403, statusText: 'Forbidden: Session does not belong to user' })
  }

  // Update session activity
  await updateSessionActivity(db, sessionId)

  const result: AuthenticatedEvent = { userId, sessionId }

  return result
}

/**
 * H3 middleware for authentication
 * Can be used to protect routes
 *
 * @returns H3 handler middleware
 */
export function authMiddleware() {
  return defineHandler(async (event) => {
    const auth = await authenticateRequest(event)

    // Attach authenticated user data to event context
    event.context.auth = auth
  })
}

/**
 * Helper function to protect a route handler with authentication
 * Wraps the handler with authentication logic
 *
 * @param handler - The route handler to protect
 * @returns Protected route handler
 */
export function defineProtectedHandler<
  T extends EventHandlerRequest = EventHandlerRequest,
  R = EventHandlerResponse
>(handler: (event: H3Event<T>) => Promise<R> | R): (event: H3Event<T>) => Promise<R> {
  return async (event: H3Event<T>) => {
    try {
      // Attach authenticated user data to event context
      const auth = await authenticateRequest(event)
      event.context.auth = auth
      return await handler(event)
    } catch (error) {
      return createErrorResonse<R>(event, error)
    }
  }
}

// Extend H3EventContext to include auth data
declare module 'nitro/h3' {
  interface H3EventContext {
    auth: AuthenticatedEvent
  }
}
