import { definePlugin } from 'nitro'
import { getRequestIP, getRequestURL, type H3Event } from 'nitro/h3'
import { typeid } from 'typeid-js'
import logger from '~/server/platform/logger'
import { parseUserAgent, parseUserAgentHash } from '~/server/utils/parser'
import { prettyMs } from '~/shared/utils/humanize'

export default definePlugin(({ hooks }) => {
  // Generate a unique request ID for tracing
  const requestId = typeid('req').toString()

  // Define paths to ignore for logging
  const ignoredPaths = ['/api/health', '/api/metrics']

  // Initialize the wide event with request context (https://loggingsucks.com)
  const buildWideEvent = (event: H3Event): Record<string, unknown> => {
    return {
      request_id: requestId, // Unique request ID
      ua_hash: parseUserAgentHash(parseUserAgent(event), 'long'),
      ua_name: parseUserAgent(event, { format: 'short' }),
      ip_address: getRequestIP(event, { xForwardedFor: true }) || 'unknown-ip',
      pathname: getRequestURL(event).pathname,
      method: event.req.method

      // Additional service metadata (uncomment and set env variables as needed)
      // service: process.env.SERVICE_NAME,
      // version: process.env.SERVICE_VERSION,
      // deployment_id: process.env.DEPLOYMENT_ID,
      // region: process.env.REGION,
    }
  }

  hooks.hook('request', (event: H3Event) => {
    // Store request start time for calculating response time
    event.context.requestStartTime = Date.now()

    // Skip logging for JWKS requests to reduce noise
    const { pathname } = getRequestURL(event)
    if (ignoredPaths.includes(pathname) || pathname.startsWith('/.well-known')) {
      return
    }

    // Send the request log with wide event context
    logger.withPrefix('REQ').withContext(buildWideEvent(event)).info('Incoming request', pathname)
  })

  hooks.hook('response', (res: Response, event: H3Event) => {
    // Calculate response time in milliseconds
    const requestStartTime = event.context.requestStartTime as number
    const responseTime = requestStartTime ? Date.now() - requestStartTime : null

    // Skip logging for JWKS requests to reduce noise
    const { pathname } = getRequestURL(event)
    if (ignoredPaths.includes(pathname) || pathname.startsWith('/.well-known')) {
      return
    }

    const status_code = res.status
    const response_time = responseTime ? prettyMs(responseTime) : null

    // Send the response log with wide event context
    logger
      .withPrefix('RES')
      .withContext(buildWideEvent(event))
      .withMetadata({ status_code, response_time })
      .info('Outgoing response', pathname)
  })
})

declare module 'nitro/h3' {
  interface H3EventContext {
    requestStartTime: number
  }
}
