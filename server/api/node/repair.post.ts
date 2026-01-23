import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { LaunchRepairOperationParams } from '~/shared/schemas/node.schema'
import type { LaunchRepairOperationRequest } from '~/shared/schemas/node.schema'
import type { LaunchRepairOperationResponse } from '~/shared/schemas/node.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<LaunchRepairOperationParams>(event)
  if (!params?.node) {
    logger.withPrefix('LaunchRepairOperation').debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<LaunchRepairOperationRequest>(event)
  if (!body?.repairType) {
    logger.withPrefix('LaunchRepairOperation').debug('Repair type is required')
    throw new HTTPError({ status: 400, statusText: 'Repair type is required' })
  }

  const data = await gfetch<LaunchRepairOperationResponse>('/v2/LaunchRepairOperation', {
    method: 'POST',
    params,
    body
  })
  logger.withMetadata(data).debug('Launching repair operation')

  const message = `Launch repair for operation ${body.repairType}`
  return createResponse<LaunchRepairOperationResponse>(event, message, { data })
})
