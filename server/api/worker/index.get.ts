import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { parseBoolean } from '~/server/utils/parser'
import type { ListWorkersParams } from '~/shared/schemas/worker.schema'
import type { ListWorkersRequest } from '~/shared/schemas/worker.schema'
import type { ListWorkersResponse } from '~/shared/schemas/worker.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('ListWorkers')

  const queryParams = getQuery(event)
  if (!queryParams?.node) {
    log.debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const params = { node: queryParams.node as ListWorkersParams['node'] }
  const body: ListWorkersRequest = {
    busyOnly: parseBoolean(queryParams?.busyOnly ?? null),
    errorOnly: parseBoolean(queryParams?.errorOnly ?? null)
  }

  const data = await gfetch<ListWorkersResponse>('/v2/ListWorkers', {
    method: 'POST',
    params,
    body
  })
  log.withMetadata(data).debug('Listing workers')

  return createResponse<ListWorkersResponse>(event, 'List Workers', { data })
})
