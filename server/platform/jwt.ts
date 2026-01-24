import { SignJWT, jwtVerify } from 'jose'
import { UAParser, type IResult } from 'ua-parser-js'
import logger from '~/server/platform/logger'
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
  // Convert hash to hex string and limit to 32 characters
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
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
  // Convert userAgent to string (handle IResult and null cases)
  const uaStringInput = typeof userAgent === 'string' ? userAgent : userAgent?.ua || 'unknown'

  // Parse user agent to get consistent format
  const parser = new UAParser(uaStringInput)
  const ua = parser.getResult()

  // Create a consistent string from user agent components
  const uaString = `${ua.browser.name || 'unknown'}-${ua.os.name || 'unknown'}-${ua.device.type || 'desktop'}`

  // Hash the user agent string
  return await hashUserAgent(uaString)
}

/**
 * Generate a JWT token using HMAC-SHA256 with standard claims
 *
 * @param payload - The token payload
 * @param expiresIn - Token expiry in seconds
 * @returns The signed JWT token
 */
export async function generateToken(payload: JWTClaims, expiresIn: number): Promise<string> {
  const secretKey = protectedEnv.SECRET_KEY

  if (!secretKey) {
    throw new Error('SECRET_KEY environment variable is not set')
  }

  const secret = new TextEncoder().encode(secretKey)
  const now = Math.floor(Date.now() / 1000)

  return await new SignJWT({
    sub: payload.sub, // Subject (User ID) - standard claim
    sid: payload.sid, // Session ID
    aud: payload.aud, // Audience - Hashed user agent (standard JWT claim)
    iss: payload.iss, // Issuer - standard claim
    nbf: payload.nbf, // Not Before - Token is valid from this time (standard JWT claim)
    typ: payload.typ // Type - Token type (standard JWT claim)
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setNotBefore(payload.nbf ?? '')
    .setExpirationTime(now + expiresIn)
    .sign(secret)
}

/**
 * Generate both access and refresh tokens with standard JWT claims
 *
 * @param user - User data
 * @param userAgent - User agent string from request headers
 * @returns Object containing access and refresh tokens with expiry times
 */
export async function generateTokenPair(
  user: { userId: string; sessionId?: string },
  userAgent: string | IResult | null
): Promise<{
  accessToken: string
  refreshToken: string
  accessTokenExpiry: number
  refreshTokenExpiry: number
}> {
  const accessTokenExpiry = protectedEnv.PUBLIC_JWT_ACCESS_TOKEN_EXPIRY
  const refreshTokenExpiry = protectedEnv.PUBLIC_JWT_REFRESH_TOKEN_EXPIRY
  const issuer = protectedEnv.PUBLIC_BASE_URL
  const audience = parseUserAgentHash(userAgent, 'long')
  const now = Math.floor(Date.now() / 1000)

  const accessToken = await generateToken(
    {
      sub: user.userId, // Subject (User ID)
      sid: user.sessionId, // Session ID
      aud: audience, // Audience - Hashed user agent
      iss: issuer, // Issuer
      nbf: now, // Not Before - Token is valid from now
      typ: 'access' // Type - Token type
    },
    accessTokenExpiry
  )

  const refreshToken = await generateToken(
    {
      sub: user.userId, // Subject (User ID)
      sid: user.sessionId, // Session ID
      aud: audience, // Audience - Hashed user agent
      iss: issuer, // Issuer
      nbf: now, // Not Before - Token is valid from now
      typ: 'refresh' // Type - Token type
    },
    refreshTokenExpiry
  )

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: now + accessTokenExpiry,
    refreshTokenExpiry: now + refreshTokenExpiry
  }
}

/**
 * Verify and decode a JWT token
 *
 * @param token - The JWT token to verify
 * @returns The decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTClaims> {
  const secretKey = protectedEnv.SECRET_KEY

  if (!secretKey) {
    throw new Error('SECRET_KEY environment variable is not set')
  }

  const secret = new TextEncoder().encode(secretKey)

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTClaims
  } catch (error) {
    logger.withError(error).error('Invalid or expired token')
    throw new Error('Invalid or expired token')
  }
}

/**
 * Verify an access token
 *
 * @param token - The access token to verify
 * @returns The decoded payload if valid
 * @throws Error if token is invalid, expired, or not an access token
 */
export async function verifyAccessToken(token: string): Promise<JWTClaims> {
  const payload = await verifyToken(token)

  if (payload.typ !== 'access') {
    throw new Error('Invalid token type: expected access token')
  }

  return payload
}

/**
 * Verify a refresh token
 *
 * @param token - The refresh token to verify
 * @returns The decoded payload if valid
 * @throws Error if token is invalid, expired, or not a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<JWTClaims> {
  const payload = await verifyToken(token)

  if (payload.typ !== 'refresh') {
    throw new Error('Invalid token type: expected refresh token')
  }

  return payload
}
