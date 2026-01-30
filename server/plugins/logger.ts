import { definePlugin } from 'nitro'
import { getRequestIP, getRequestURL, type H3Event } from 'nitro/h3'
import { typeid } from 'typeid-js'
import type { IResult } from 'ua-parser-js'
import logger from '~/server/platform/logger'
import { parseUserAgent, parseUserAgentHash } from '~/server/utils/parser'
import { prettyMs } from '~/shared/utils/humanize'

function isExcludedFromLog(pathname: string): boolean {
  // Define paths to ignore for logging
  const ignoredPaths = [
    '/favicon.ico',
    '/favicon.png',
    '/favicon.svg',
    '/robots.txt',
    '/api/health',
    '/api/metrics'
  ]
  return pathname.startsWith('/.well-known') || ignoredPaths.includes(pathname) ? true : false
}

export default definePlugin(({ hooks }) => {
  hooks.hook('request', (event: H3Event) => {
    const method = event.req.method
    const requestId = typeid('req').toString()
    const ua_hash = parseUserAgentHash(parseUserAgent(event), 'long')
    const ua_name = parseUserAgent(event, { format: 'short' })
    const ip_address = getRequestIP(event, { xForwardedFor: true }) || 'unknown-ip'
    const { pathname } = getRequestURL(event)

    // Initialize the wide event with request context (https://loggingsucks.com)
    // You can store extra information such as: serviceName, deploymentId, region, etc.
    event.context.logContext = { ua_hash, ua_name, ip_address }
    event.context.requestId = requestId // Unique request ID for tracing
    event.context.requestStartTime = Date.now() // Calculate response time

    // Skip logging for JWKS requests to reduce noise
    if (isExcludedFromLog(pathname)) {
      return
    }

    logger
      .withPrefix('REQ')
      .withContext(event.context.logContext)
      .info('Incoming', method, requestId, pathname)
  })

  hooks.hook('response', (res: Response, event: H3Event) => {
    // Calculate response time in milliseconds
    const responseTime = event.context.requestStartTime
      ? Date.now() - event.context.requestStartTime
      : null

    const { pathname } = getRequestURL(event)
    const response_time = responseTime ? prettyMs(responseTime) : null
    const request_id = event.context.requestId
    const status_code = res.status
    const method = event.req.method

    // Skip logging for JWKS requests to reduce noise
    if (isExcludedFromLog(pathname)) {
      return
    }

    logger
      .withPrefix('RES')
      .withContext({ status_code, response_time })
      .info('Outgoing', method, request_id, pathname)
  })
})

interface LogContext {
  ua_hash: string
  ua_name: IResult | string | null
  ip_address: string
}

declare module 'nitro/h3' {
  interface H3EventContext {
    requestStartTime: number
    requestId: string
    logContext: LogContext
  }
}
