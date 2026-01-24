import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { SetWorkerVariableParams } from '~/shared/schemas/worker.schema'
import type { SetWorkerVariableRequest } from '~/shared/schemas/worker.schema'
import type { SetWorkerVariableResponse } from '~/shared/schemas/worker.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('SetWorkerVariable')

  const params = getQuery<SetWorkerVariableParams>(event)
  if (!params?.node) {
    log.warn('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<SetWorkerVariableRequest>(event)
  if (!body?.variable || !body?.value) {
    log.warn('Variable name and value are required')
    throw new HTTPError({ status: 400, statusText: 'Variable name and value are required' })
  }

  logger
    .withMetadata({ node: params.node, variable: body.variable, value: body.value })
    .debug('Setting worker variable')
  const data = await gfetch<SetWorkerVariableResponse>('/v2/SetWorkerVariable', {
    method: 'POST',
    params,
    body
  })

  return createResponse<SetWorkerVariableResponse>(event, 'Set Worker Variable', { data })
})
