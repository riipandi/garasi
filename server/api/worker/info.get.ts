import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetWorkerInfoParams } from '~/shared/schemas/worker.schema'
import type { GetWorkerInfoRequest } from '~/shared/schemas/worker.schema'
import type { GetWorkerInfoResponse } from '~/shared/schemas/worker.schema'

// Move request body to params because this is GET endpoint
type GetWorkerInfoQueryParams = GetWorkerInfoParams & GetWorkerInfoRequest

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<GetWorkerInfoQueryParams>(event)
  if (!params?.node || !params?.id) {
    logger.withPrefix('GetWorkerInfo').debug('Node and id parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node and id parameter is required' })
  }

  const data = await gfetch<GetWorkerInfoResponse>('/v2/GetWorkerInfo', {
    method: 'POST',
    params: { node: params.node },
    body: { id: Number(params.id) }
  })
  logger.withMetadata(data).debug('Getting worker information')

  return createResponse<GetWorkerInfoResponse>(event, 'Get Worker Information', { data })
})
