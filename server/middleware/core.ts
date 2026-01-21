import type { ILogLayer } from 'loglayer'
import { defineHandler, getRequestURL } from 'nitro/h3'
import { dbClient } from '~/server/database/db.client'
import type { DBContext } from '~/server/database/db.schema'
import logger from '~/server/platform/logger'

export default defineHandler((event) => {
  const reqUrl = getRequestURL(event)

  // Attach some parameter and services to be used in handler
  event.context.baseURL = reqUrl.origin
  event.context.db = dbClient
  event.context.logger = logger
})

declare module 'nitro/h3' {
  interface H3EventContext {
    baseURL: string
    db: DBContext
    logger: ILogLayer
  }
}
