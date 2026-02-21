import { lazy } from 'loglayer'
import { definePlugin } from 'nitro'
import { getRequestIP, getRequestURL } from 'nitro/h3'
import type { H3Event } from 'nitro/h3'
import { typeid } from 'typeid-js'
import type { IResult } from 'ua-parser-js'
import { logger, shouldIgnorePath } from '~/server/platform/logger'
import { parseUserAgent, parseUserAgentHash } from '~/server/utils/parser'
import { protectedEnv } from '~/shared/envars'
import { prettyMs } from '~/shared/utils/humanize'

interface LogContext {
  ua_hash: string | null
  ua_name: IResult | string | null
  ip_address: string
}

export default definePlugin(({ hooks }) => {
  hooks.hook('request', (event: H3Event) => {
    if (protectedEnv.APP_LOG_LEVEL === 'none') return

    const method = event.req.method
    const requestId = typeid('req').toString()
    const ua_name = parseUserAgent(event, { format: 'short' })
    const ua_hash = parseUserAgentHash(parseUserAgent(event), 'long') || 'unknown'
    const ip_address = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const { pathname } = getRequestURL(event)

    event.context.logContext = { ua_hash, ua_name, ip_address }
    event.context.requestStartTime = Date.now()
    event.context.requestId = requestId

    // Inject RequestID to headers
    event.res.headers.set('x-request-id', requestId)
    event.res.headers.set('x-ua-hash', ua_hash)

    if (shouldIgnorePath(pathname)) {
      return
    }

    logger
      .withPrefix('REQ')
      .withContext({ ...lazy(() => event.context.logContext), method: lazy(() => method) })
      .info('Incoming', method, requestId, pathname)
  })

  hooks.hook('response', (res: Response, event: H3Event) => {
    if (protectedEnv.APP_LOG_LEVEL === 'none') return

    const { pathname } = getRequestURL(event)
    const responseTime = event.context.requestStartTime
      ? Date.now() - event.context.requestStartTime
      : null
    const response_time = responseTime ? prettyMs(responseTime) : null
    const request_id = event.context.requestId
    const status_code = res.status
    const method = event.req.method

    if (shouldIgnorePath(pathname)) {
      return
    }

    logger
      .withPrefix('RES')
      .withContext({
        status_code: lazy(() => status_code),
        response_time: lazy(() => response_time)
      })
      .info('Outgoing', method, request_id, pathname, status_code)
  })
})

declare module 'nitro/h3' {
  interface H3EventContext {
    requestStartTime: number
    requestId: string
    logContext: LogContext
  }
}
