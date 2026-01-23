import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetWorkerVariableParams } from '~/shared/schemas/worker.schema'
import type { GetWorkerVariableRequest } from '~/shared/schemas/worker.schema'
import type { GetWorkerVariableResponse } from '~/shared/schemas/worker.schema'

// Move request body to params because this is GET endpoint
type GetWorkerVariableQueryParams = GetWorkerVariableParams & GetWorkerVariableRequest

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<GetWorkerVariableQueryParams>(event)
  if (!params?.node) {
    logger.withPrefix('GetWorkerVariable').debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const data = await gfetch<GetWorkerVariableResponse>('/v2/GetWorkerVariable', {
    method: 'POST',
    params,
    body: { variable: params.variable }
  })
  logger.withMetadata(data).debug('Getting worker variable')

  return createResponse<GetWorkerVariableResponse>(event, 'Get Worker Variable', { data })
})
