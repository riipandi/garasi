import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { SetWorkerVariableParams } from '~/shared/schemas/worker.schema'
import type { SetWorkerVariableRequest } from '~/shared/schemas/worker.schema'
import type { SetWorkerVariableResponse } from '~/shared/schemas/worker.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<SetWorkerVariableParams>(event)
  if (!params?.node) {
    logger.withPrefix('SetWorkerVariable').debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<SetWorkerVariableRequest>(event)
  if (!body?.variable || !body?.value) {
    logger.withPrefix('SetWorkerVariable').debug('Variable name and value are required')
    throw new HTTPError({ status: 400, statusText: 'Variable name and value are required' })
  }

  const data = await gfetch<SetWorkerVariableResponse>('/v2/SetWorkerVariable', {
    method: 'POST',
    params,
    body
  })
  logger.withMetadata(data).debug('Setting worker variable')

  return createResponse<SetWorkerVariableResponse>(event, 'Set Worker Variable', { data })
})
