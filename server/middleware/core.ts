import { defineHandler, getRequestURL } from 'nitro/h3'
import { dbClient } from '~/server/database/db.client'
import type { DBContext } from '~/server/database/db.schema'

export default defineHandler((event) => {
  const reqUrl = getRequestURL(event)

  // Attach some parameter and services to be used in handler
  event.context.baseURL = reqUrl.origin
  event.context.db = dbClient
})

declare module 'nitro/h3' {
  interface H3EventContext {
    baseURL: string
    db: DBContext
  }
}
