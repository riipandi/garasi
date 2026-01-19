import { defineHandler } from 'nitro/h3'
import { ofetch, type $Fetch } from 'ofetch'
import { protectedEnv } from '~/shared/envars'

export default defineHandler((event) => {
  event.context.gfetch = ofetch.create({
    baseURL: protectedEnv.GARAGE_ADMIN_API,
    headers: { Authorization: `Bearer ${protectedEnv.GARAGE_ADMIN_TOKEN}` },
    signal: AbortSignal.timeout(10_000)
  })
})

declare module 'nitro/h3' {
  interface H3EventContext {
    gfetch: $Fetch
  }
}
