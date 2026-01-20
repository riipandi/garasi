import { defineHandler, HTTPError } from 'nitro/h3'
import { verifyAccessToken } from '~/server/platform/jwt'
import { getSessionById, updateSessionActivity } from '~/server/services/session.service'

export interface AuthenticatedEvent {
  userId: number
  sessionId?: string
}

/**
 * Middleware to authenticate requests using JWT access tokens
 * and optionally validate sessions
 *
 * @param event - H3 event object
 * @param options - Options for authentication
 * @returns Authenticated user data
 */
export async function authenticateRequest(
  event: any,
  options: { requireSession?: boolean } = {}
): Promise<AuthenticatedEvent> {
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

  const result: AuthenticatedEvent = {
    userId: Number(userId)
  }

  // Optionally validate session
  if (options.requireSession) {
    const sessionId = payload.sid

    if (!sessionId) {
      throw new HTTPError({
        status: 401,
        statusText: 'Unauthorized: Session ID is required'
      })
    }

    // Get session from database
    const session = await getSessionById(db, sessionId)

    if (!session) {
      throw new HTTPError({
        status: 401,
        statusText: 'Unauthorized: Invalid or expired session'
      })
    }

    // Verify session belongs to the user
    if (session.user_id !== result.userId) {
      throw new HTTPError({
        status: 403,
        statusText: 'Forbidden: Session does not belong to user'
      })
    }

    result.sessionId = sessionId

    // Update session activity
    await updateSessionActivity(db, sessionId)
  }

  return result
}

/**
 * H3 middleware for authentication
 * Can be used to protect routes
 *
 * @param options - Options for authentication
 * @returns H3 handler middleware
 */
export function authMiddleware(options: { requireSession?: boolean } = {}) {
  return defineHandler(async (event) => {
    const auth = await authenticateRequest(event, options)

    // Attach authenticated user data to event context
    event.context.auth = auth
  })
}

// Extend H3EventContext to include auth data
declare module 'nitro/h3' {
  interface H3EventContext {
    auth?: AuthenticatedEvent
  }
}
