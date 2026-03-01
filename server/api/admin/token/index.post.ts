import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type {
  CreateAdminTokenRequest,
  CreateAdminTokenResponse
} from '~/shared/schemas/admin-token.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('CreateAdminToken')

  const body = await readBody<CreateAdminTokenRequest>(event)
  if (!body?.name) {
    log.warn('Admin token name is required')
    throw new HTTPError({ status: 400, statusText: 'Name of the admin API token is required' })
  }

  log.withMetadata({ name: body.name, expiration: body.expiration }).debug('Creating admin token')
  const resp = await gfetch<CreateAdminTokenResponse>('/v2/CreateAdminToken', {
    method: 'POST',
    body
  })

  return createResponse<CreateAdminTokenResponse>(event, 'Create Admin Token', { data: resp })
})
