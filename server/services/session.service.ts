import type { Selectable } from 'kysely'
import { typeid } from 'typeid-js'
import { UAParser, type IResult } from 'ua-parser-js'
import type { DBContext } from '~/server/database/db.schema'
import type { SessionTable } from '~/server/database/schemas/session'
import { isIResult } from '~/server/utils/parser'
import { protectedEnv } from '~/shared/envars'

/**
 * Parse user agent and generate device info string
 *
 * @param userAgent - User agent string from request headers
 * @returns Device info string (e.g., "Chrome on macOS (desktop)")
 */
export function parseDeviceInfo(userAgent: string | IResult | null): string {
  if (!userAgent) {
    return 'unknown'
  }

  let ua: IResult

  if (isIResult(userAgent)) {
    ua = userAgent
  } else {
    const parser = new UAParser(userAgent)
    ua = parser.getResult()
  }

  const browser = ua.browser.name || 'Unknown Browser'
  const os = ua.os.name || 'Unknown OS'
  const device = ua.device.type || 'desktop'

  return `${browser} on ${os} (${device})`
}

/**
 * Generate a unique session ID using typeid-js
 *
 * @returns Unique session ID
 */
export function generateSessionId(): string {
  return typeid('sess').toString()
}

/**
 * Create a new session for a user
 *
 * @param db - Database context
 * @param userId - User ID
 * @param ipAddress - IP address of the user
 * @param userAgent - User agent string
 * @returns Created session record
 */
export async function createSession(
  db: DBContext,
  userId: string,
  ipAddress: string,
  userAgent: string | IResult | null
): Promise<{ sessionId: string; sessionRecord: Selectable<SessionTable> | undefined }> {
  const sessionId = generateSessionId()
  const deviceInfo = parseDeviceInfo(userAgent)
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + protectedEnv.PUBLIC_TOKEN_EXPIRY

  const sessionRecord = await db
    .insertInto('sessions')
    .values({
      id: sessionId,
      userId: userId,
      ipAddress: ipAddress,
      userAgent: typeof userAgent === 'string' ? userAgent : (userAgent?.ua ?? ''),
      deviceInfo: deviceInfo,
      isActive: 1,
      lastActivityAt: now,
      expiresAt: expiresAt
    })
    .returningAll()
    .executeTakeFirst()

  return { sessionId, sessionRecord }
}

/**
 * Update session last activity timestamp
 *
 * @param db - Database context
 * @param sessionId - Session ID
 * @returns Updated session record or undefined
 */
export async function updateSessionActivity(
  db: DBContext,
  sessionId: string
): Promise<Selectable<SessionTable> | undefined> {
  const now = Math.floor(Date.now() / 1000)

  const updatedSession = await db
    .updateTable('sessions')
    .set({ lastActivityAt: now, updatedAt: now })
    .where('id', '=', sessionId)
    .where('isActive', '=', 1)
    .returningAll()
    .executeTakeFirst()

  return updatedSession
}

/**
 * Get session by session ID
 *
 * @param db - Database context
 * @param sessionId - Session ID
 * @returns Session record or undefined
 */
export async function getSessionById(
  db: DBContext,
  sessionId: string
): Promise<Selectable<SessionTable> | undefined> {
  return await db
    .selectFrom('sessions')
    .selectAll()
    .where('id', '=', sessionId)
    .where('isActive', '=', 1)
    .where('expiresAt', '>', Math.floor(Date.now() / 1000))
    .executeTakeFirst()
}

/**
 * Deactivate a session
 *
 * @param db - Database context
 * @param sessionId - Session ID
 * @returns Number of affected rows
 */
export async function deactivateSession(db: DBContext, sessionId: string): Promise<number> {
  const now = Math.floor(Date.now() / 1000)

  const result = await db
    .updateTable('sessions')
    .set({ isActive: 0, updatedAt: now })
    .where('id', '=', sessionId)
    .executeTakeFirst()

  return Number(result.numUpdatedRows)
}

/**
 * Deactivate all sessions for a user except the current one
 *
 * @param db - Database context
 * @param userId - User ID
 * @param currentSessionId - Current session ID to keep active
 * @returns Number of affected rows
 */
export async function deactivateOtherSessions(
  db: DBContext,
  userId: string,
  currentSessionId: string
): Promise<number> {
  const now = Math.floor(Date.now() / 1000)

  const result = await db
    .updateTable('sessions')
    .set({ isActive: 0, updatedAt: now })
    .where('userId', '=', userId)
    .where('id', '!=', currentSessionId)
    .where('isActive', '=', 1)
    .executeTakeFirst()

  return Number(result.numUpdatedRows)
}

/**
 * Deactivate all sessions for a user
 *
 * @param db - Database context
 * @param userId - User ID
 * @returns Number of affected rows
 */
export async function deactivateAllSessions(db: DBContext, userId: string): Promise<number> {
  const now = Math.floor(Date.now() / 1000)

  const result = await db
    .updateTable('sessions')
    .set({ isActive: 0, updatedAt: now })
    .where('userId', '=', userId)
    .where('isActive', '=', 1)
    .executeTakeFirst()

  return Number(result.numUpdatedRows)
}

/**
 * Get all active sessions for a user
 *
 * @param db - Database context
 * @param userId - User ID
 * @returns Array of active sessions
 */
export async function getUserSessions(
  db: DBContext,
  userId: string
): Promise<Selectable<SessionTable>[]> {
  const now = Math.floor(Date.now() / 1000)

  const sessions = await db
    .selectFrom('sessions')
    .selectAll()
    .where('userId', '=', userId)
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .orderBy('lastActivityAt', 'desc')
    .execute()

  return sessions
}

/**
 * Clean up expired sessions
 *
 * @param db - Database context
 * @returns Number of deleted rows
 */
export async function cleanupExpiredSessions(db: DBContext): Promise<number> {
  const now = Math.floor(Date.now() / 1000)

  const result = await db.deleteFrom('sessions').where('expiresAt', '<=', now).executeTakeFirst()

  return Number(result.numDeletedRows)
}
