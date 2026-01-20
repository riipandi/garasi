import { typeid } from 'typeid-js'
import { UAParser } from 'ua-parser-js'
import { protectedEnv } from '~/shared/envars'
import type { DBContext } from '../database/db.schema'

/**
 * Parse user agent and generate device info string
 *
 * @param userAgent - User agent string from request headers
 * @returns Device info string (e.g., "Chrome on macOS (desktop)")
 */
export function parseDeviceInfo(userAgent: string): string {
  const parser = new UAParser(userAgent)
  const ua = parser.getResult()

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
 * Generate a unique refresh token ID using typeid-js
 *
 * @returns Unique refresh token ID
 */
export function generateRefreshTokenId(): string {
  return typeid('rtoken').toString()
}

/**
 * Hash a refresh token for storage in the database
 *
 * @param token - The refresh token to hash
 * @returns Hashed token
 */
export async function hashRefreshToken(token: string): Promise<string> {
  const hasher = new Bun.CryptoHasher('blake2b256')
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  hasher.update(data)
  const hashBuffer = hasher.digest()
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
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
  userAgent: string
): Promise<{ sessionId: string; sessionRecord: any }> {
  const sessionId = generateSessionId()
  const deviceInfo = parseDeviceInfo(userAgent)
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + protectedEnv.PUBLIC_JWT_ACCESS_TOKEN_EXPIRY

  const sessionRecord = await db
    .insertInto('sessions')
    .values({
      id: sessionId,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_info: deviceInfo,
      is_active: 1,
      last_activity_at: now,
      expires_at: expiresAt
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
 * @returns Updated session record or null
 */
export async function updateSessionActivity(db: DBContext, sessionId: string): Promise<any | null> {
  const now = Math.floor(Date.now() / 1000)

  const updatedSession = await db
    .updateTable('sessions')
    .set({ last_activity_at: now, updated_at: now })
    .where('id', '=', sessionId)
    .where('is_active', '=', 1)
    .returningAll()
    .executeTakeFirst()

  return updatedSession
}

/**
 * Get session by session ID
 *
 * @param db - Database context
 * @param sessionId - Session ID
 * @returns Session record or null
 */
export async function getSessionById(db: DBContext, sessionId: string): Promise<any | null> {
  const now = Math.floor(Date.now() / 1000)

  const session = await db
    .selectFrom('sessions')
    .selectAll()
    .where('id', '=', sessionId)
    .where('is_active', '=', 1)
    .where('expires_at', '>', now)
    .executeTakeFirst()

  return session
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
    .set({ is_active: 0, updated_at: now })
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
    .set({ is_active: 0, updated_at: now })
    .where('user_id', '=', userId)
    .where('id', '!=', currentSessionId)
    .where('is_active', '=', 1)
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
    .set({ is_active: 0, updated_at: now })
    .where('user_id', '=', userId)
    .where('is_active', '=', 1)
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
export async function getUserSessions(db: DBContext, userId: string): Promise<any[]> {
  const now = Math.floor(Date.now() / 1000)

  const sessions = await db
    .selectFrom('sessions')
    .selectAll()
    .where('user_id', '=', userId)
    .where('is_active', '=', 1)
    .where('expires_at', '>', now)
    .orderBy('last_activity_at', 'desc')
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

  const result = await db.deleteFrom('sessions').where('expires_at', '<=', now).executeTakeFirst()

  return Number(result.numDeletedRows)
}

/**
 * Clean up expired and revoked refresh tokens
 *
 * @param db - Database context
 * @returns Number of deleted rows
 */
export async function cleanupExpiredRefreshTokens(db: DBContext): Promise<number> {
  const now = Math.floor(Date.now() / 1000)

  const result = await db
    .deleteFrom('refresh_tokens')
    .where('expires_at', '<=', now)
    .where('is_revoked', '=', 1)
    .executeTakeFirst()

  return Number(result.numDeletedRows)
}

/**
 * Store a refresh token in the database
 *
 * @param db - Database context
 * @param userId - User ID
 * @param sessionId - Session ID
 * @param refreshToken - The refresh token to store (will be hashed)
 * @param expiresAt - Expiration timestamp
 * @returns Created refresh token record
 */
export async function storeRefreshToken(
  db: DBContext,
  userId: string,
  sessionId: string,
  refreshToken: string,
  expiresAt: number
): Promise<any> {
  const tokenHash = await hashRefreshToken(refreshToken)
  const refreshTokenId = generateRefreshTokenId()

  const refreshTokenRecord = await db
    .insertInto('refresh_tokens')
    .values({
      id: refreshTokenId,
      user_id: userId,
      session_id: sessionId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      is_revoked: 0
    })
    .returningAll()
    .executeTakeFirst()

  return refreshTokenRecord
}

/**
 * Validate a refresh token
 *
 * @param db - Database context
 * @param refreshToken - The refresh token to validate
 * @returns Valid refresh token record or null
 */
export async function validateRefreshToken(
  db: DBContext,
  refreshToken: string
): Promise<any | null> {
  const tokenHash = await hashRefreshToken(refreshToken)
  const now = Math.floor(Date.now() / 1000)

  const tokenRecord = await db
    .selectFrom('refresh_tokens')
    .selectAll()
    .where('token_hash', '=', tokenHash)
    .where('is_revoked', '=', 0)
    .where('expires_at', '>', now)
    .executeTakeFirst()

  return tokenRecord
}

/**
 * Revoke a refresh token
 *
 * @param db - Database context
 * @param refreshToken - The refresh token to revoke
 * @returns Number of affected rows
 */
export async function revokeRefreshToken(db: DBContext, refreshToken: string): Promise<number> {
  const tokenHash = await hashRefreshToken(refreshToken)
  const now = Math.floor(Date.now() / 1000)

  const result = await db
    .updateTable('refresh_tokens')
    .set({ is_revoked: 1, revoked_at: now })
    .where('token_hash', '=', tokenHash)
    .executeTakeFirst()

  return Number(result.numUpdatedRows)
}

/**
 * Revoke all refresh tokens for a session
 *
 * @param db - Database context
 * @param sessionId - Session ID
 * @returns Number of affected rows
 */
export async function revokeSessionRefreshTokens(
  db: DBContext,
  sessionId: string
): Promise<number> {
  const now = Math.floor(Date.now() / 1000)

  const result = await db
    .updateTable('refresh_tokens')
    .set({ is_revoked: 1, revoked_at: now })
    .where('session_id', '=', sessionId)
    .where('is_revoked', '=', 0)
    .executeTakeFirst()

  return Number(result.numUpdatedRows)
}

/**
 * Revoke all refresh tokens for a user
 *
 * @param db - Database context
 * @param userId - User ID
 * @returns Number of affected rows
 */
export async function revokeUserRefreshTokens(db: DBContext, userId: string): Promise<number> {
  const now = Math.floor(Date.now() / 1000)

  const result = await db
    .updateTable('refresh_tokens')
    .set({ is_revoked: 1, revoked_at: now })
    .where('user_id', '=', userId)
    .where('is_revoked', '=', 0)
    .executeTakeFirst()

  return Number(result.numUpdatedRows)
}
