import { SignJWT, jwtVerify } from 'jose'
import { HTTPError } from 'nitro/h3'
import { UAParser, type IResult } from 'ua-parser-js'
import { logger } from '~/server/platform/logger'
import { parseUserAgentHash } from '~/server/utils/parser'
import { protectedEnv } from '~/shared/envars'
import type { JWTClaims } from '~/shared/schemas/auth.schema'

/**
 * Generate a hash from user agent string using Bun.CryptoHasher with blake2b256
 *
 * @param userAgent - User agent string from request headers
 * @returns BLAKE2b-256 hash of the user agent (32 characters)
 */
export async function hashUserAgent(userAgent: string): Promise<string> {
  const hasher = new Bun.CryptoHasher('blake2b256')
  const encoder = new TextEncoder()
  const data = encoder.encode(userAgent)
  hasher.update(data)
  const hashBuffer = hasher.digest()
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hashHex.slice(0, 32)
}

/**
 * Parse user agent and generate audience hash
 *
 * @param userAgent - User agent string from request headers
 * @returns Hashed user agent string for JWT audience
 */
export async function generateAudienceFromUserAgent(
  userAgent: string | IResult | null
): Promise<string> {
  const uaStringInput = typeof userAgent === 'string' ? userAgent : userAgent?.ua || 'unknown'

  const parser = new UAParser(uaStringInput)
  const ua = parser.getResult()

  const uaString = `${ua.browser.name || 'unknown'}-${ua.os.name || 'unknown'}-${ua.device.type || 'desktop'}`

  return await hashUserAgent(uaString)
}

/**
 * Generate a JWT token with standard JWT claims
 *
 * @param userId - User ID
 * @param sessionId - Session ID
 * @param userAgent - User agent string from request headers
 * @returns Object containing token and expiry time
 */
export async function generateToken(
  userId: string,
  sessionId: string,
  userAgent: string | IResult | null
): Promise<{ token: string; tokenExpiry: number }> {
  const secretKey = protectedEnv.APP_SECRET_KEY

  if (!secretKey) {
    throw new Error('APP_SECRET_KEY environment variable is not set')
  }

  const secret = new TextEncoder().encode(secretKey)
  const tokenExpiry = protectedEnv.PUBLIC_TOKEN_EXPIRY
  const issuer = protectedEnv.PUBLIC_BASE_URL
  const audience = parseUserAgentHash(userAgent, 'long')
  const now = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({
    sub: userId,
    sid: sessionId,
    aud: audience,
    iss: issuer,
    nbf: now,
    typ: 'access'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setNotBefore(now)
    .setExpirationTime(now + tokenExpiry)
    .sign(secret)

  return {
    token,
    tokenExpiry: now + tokenExpiry
  }
}

/**
 * Verify and decode a JWT token
 *
 * @param token - The JWT token to verify
 * @returns The decoded payload if valid
 * @throws HTTPError if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTClaims> {
  const secretKey = protectedEnv.APP_SECRET_KEY

  if (!secretKey) {
    throw new Error('APP_SECRET_KEY environment variable is not set')
  }

  const secret = new TextEncoder().encode(secretKey)

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTClaims
  } catch (error) {
    logger.withError(error).error('Invalid or expired token')
    throw new HTTPError({ status: 401, statusText: 'Invalid or expired token' })
  }
}

/**
 * Verify an access token
 *
 * @param token - The access token to verify
 * @returns The decoded payload if valid
 * @throws HTTPError if token is invalid, expired, or not an access token
 */
export async function verifyAccessToken(token: string): Promise<JWTClaims> {
  const payload = await verifyToken(token)

  if (payload.typ !== 'access') {
    throw new HTTPError({ status: 401, statusText: 'Invalid token type: expected access token' })
  }

  return payload
}
