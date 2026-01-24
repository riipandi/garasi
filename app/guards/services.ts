import { decodeJwt } from 'jose/jwt/decode'
import type { JWTClaims } from '~/shared/schemas/auth.schema'

/**
 * Extract session ID from access token using jose library
 *
 * @param token - The access token
 * @returns The session ID or null if not found
 */
export function extractSessionIdFromToken(token: string): string | null {
  try {
    const payload = decodeJwt<JWTClaims>(token)
    return payload?.sid || null
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}
