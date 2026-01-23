import { defineHandler } from 'nitro/h3'
import { ofetch, type $Fetch } from 'ofetch'
import { logger } from '~/server/platform/logger'
import { protectedEnv } from '~/shared/envars'

export default defineHandler((event) => {
  const log = logger.withPrefix('GARAGE')
  const adminToken = `Bearer ${protectedEnv.GARAGE_ADMIN_TOKEN}`
  event.context.gfetch = ofetch.create({
    baseURL: protectedEnv.GARAGE_ADMIN_API,
    headers: { Authorization: adminToken },
    signal: AbortSignal.timeout(10_000),
    onRequest(ctx) {
      log.withMetadata({ request: ctx.request }).trace('onRequest')
    },
    onResponse({ response }) {
      log.withMetadata({ ...response._data }).trace('onResponse')
    },
    onRequestError({ error }) {
      log.withError(error).trace('onRequestError')
    },
    onResponseError({ error, response }) {
      log.withMetadata(response).withError(error).trace('onResponseError')
    }
  })
})

declare module 'nitro/h3' {
  interface H3EventContext {
    gfetch: $Fetch
  }
}
