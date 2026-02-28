import { type H3Event, type HTTPEvent, isHTTPEvent } from 'nitro/h3'
import { type IResult, UAParser } from 'ua-parser-js'

export type Blake3OutputLength = 8 | 16 | 32 | 64

export function hashBlake(input: string | Uint8Array, len: Blake3OutputLength = 32): string {
  const inputBytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  if (![8, 16, 32, 64].includes(len)) {
    throw new RangeError('outputLength must be one of: 8, 16, 32 or 64 (bytes)')
  }
  const hasher = new Bun.CryptoHasher('blake2b256')
  hasher.update(inputBytes)
  const hashBuffer = hasher.digest()
  const hashArray = Array.from(new Uint8Array(hashBuffer).slice(0, len))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function parseUserAgent(
  event: H3Event | HTTPEvent,
  opts?: { skipIfMissing?: boolean; format?: 'short' | 'long' | 'raw' }
): IResult | string | null {
  const req = isHTTPEvent(event) ? event.req : (event as H3Event).req
  const userAgent = req.headers.get('User-Agent') ?? req.headers.get('user-agent') ?? null

  if (!userAgent) {
    if (opts?.skipIfMissing) return null
    return null
  }

  // Parse User Agent using ua-parser-js
  const uaParser = new UAParser(userAgent)
  const browser = uaParser.getBrowser()
  const os = uaParser.getOS()

  if (opts?.format === 'short') {
    const osName = os.name ?? ''
    const osVersion = os.version ?? ''
    const browserName = browser.name ?? ''
    const browserVersion = browser.version ?? ''
    if (browserName || osName) {
      const clientOS = [osName, osVersion].filter(Boolean).join('_')
      const browserInfo = [browserName, browserVersion].filter(Boolean).join('_')
      return [clientOS, browserInfo].filter(Boolean).join('_')
    }
    return String(userAgent)
  }

  if (opts?.format === 'raw') {
    return userAgent
  }

  return uaParser.getResult()
}

export function isIResult(v: any): v is IResult {
  return (
    v != null &&
    typeof v === 'object' &&
    typeof v.ua === 'string' &&
    typeof v.browser === 'object' &&
    typeof v.cpu === 'object' &&
    typeof v.device === 'object' &&
    typeof v.engine === 'object' &&
    typeof v.os === 'object'
  )
}

export function parseUserAgentHash(
  userAgent: string | IResult | null,
  format: 'short' | 'long' = 'short'
): string {
  // if (userAgent == null) return null
  const uaString = isIResult(userAgent) ? userAgent.ua : userAgent
  const uaBytes = new TextEncoder().encode(String(uaString))
  return format === 'short' ? hashBlake(uaBytes, 8) : hashBlake(uaBytes, 16)
}

/**
 * Type guard functions for runtime type checking
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean'
}

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !Number.isNaN(value)
}

export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value)
}

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Robust value parser that infers and converts raw string values to the target type.
 * Handles boolean, number, string, array, and object types automatically.
 *
 * @example
 * ```typescript
 * const boolSetting = await getSetting('key', {}) as boolean // returns boolean
 * const numSetting = await getSetting('key', {}) as number   // returns number
 * const strSetting = await getSetting('key', {}) as string   // returns string
 * const arrSetting = await getSetting('key', {}) as string[] // returns string[]
 * const objSetting = await getSetting('key', {}) as {a: string} // returns object
 * ```
 */
export const parseValue = <T = unknown>(value: string | null): T => {
  if (value === null || value === '') {
    return '' as unknown as T
  }

  try {
    const parsed = JSON.parse(value)
    return parsed as T
  } catch {
    // JSON parse failed, try type-specific parsing based on string content
    const lowerValue = value.toLowerCase().trim()

    // Boolean parsing
    if (lowerValue === 'true') {
      return true as unknown as T
    }
    if (lowerValue === 'false') {
      return false as unknown as T
    }

    // Number parsing
    const num = Number(value)
    if (!Number.isNaN(num) && value.trim() !== '' && !Number.isNaN(Number(value.trim()))) {
      return num as unknown as T
    }

    // Default to string
    return value as unknown as T
  }
}

/**
 * Type-safe parser for boolean values
 * @example
 * ```typescript
 * const isEnabled = parseBoolean('true')      // true
 * const isEnabled = parseBoolean('false')     // false
 * const isEnabled = parseBoolean('1')         // true
 * const isEnabled = parseBoolean('0')         // false
 * const isEnabled = parseBoolean('yes')       // true
 * const isEnabled = parseBoolean(null)        // false
 * ```
 */
export const parseBoolean = (value: string | null): boolean => {
  if (value === null || value === '') {
    return false
  }
  const lowerValue = value.toLowerCase().trim()
  if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
    return true
  }
  if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
    return false
  }
  // Try JSON parse
  try {
    const parsed = JSON.parse(value)
    return Boolean(parsed)
  } catch {
    return false
  }
}

/**
 * Type-safe parser for number values
 * @example
 * ```typescript
 * const count = parseNumber('42')      // 42
 * const count = parseNumber('3.14')    // 3.14
 * const count = parseNumber('invalid') // 0
 * const count = parseNumber(null)      // 0
 * ```
 */
export const parseNumber = (value: string | null): number => {
  if (value === null || value === '') {
    return 0
  }
  const num = Number(value)
  return Number.isNaN(num) ? 0 : num
}

/**
 * Type-safe parser for string values
 * @example
 * ```typescript
 * const text = parseString('hello') // 'hello'
 * const text = parseString(null)     // ''
 * ```
 */
export const parseString = (value: string | null): string => {
  return value?.toString() ?? ''
}

/**
 * Type-safe parser for array values
 * @example
 * ```typescript
 * const items = parseArray<string>('["a","b"]') // ['a', 'b']
 * const items = parseArray<string>('invalid')  // []
 * const items = parseArray<string>(null)        // []
 * ```
 */
export const parseArray = <T = unknown>(value: string | null): T[] => {
  if (value === null || value === '') {
    return [] as T[]
  }
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : ([] as T[])
  } catch {
    return [] as T[]
  }
}

/**
 * Type-safe parser for object values
 * @example
 * ```typescript
 * const config = parseObject<{enabled: boolean}>('{"enabled": true}') // {enabled: true}
 * const config = parseObject<{enabled: boolean}>('invalid')           // {}
 * const config = parseObject<{enabled: boolean}>(null)               // {}
 * ```
 */
export const parseObject = <T extends Record<string, unknown> = Record<string, unknown>>(
  value: string | null
): T => {
  if (value === null || value === '') {
    return {} as T
  }
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as T)
      : ({} as T)
  } catch {
    return {} as T
  }
}

/**
 * Convert PascalCase to snake_case
 * e.g., CommonPrefixes -> common_prefixes, Contents -> contents
 */
export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }

  if (typeof obj !== 'object') {
    return obj
  }

  const result: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
    result[snakeKey] = toSnakeCase(obj[key])
  }
  return result
}
