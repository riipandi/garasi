import { HTTPError, getQuery, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface LaunchRepairOperationParams {
  node: string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

type RepairType =
  | 'tables'
  | 'blocks'
  | 'versions'
  | 'multipartUploads'
  | 'blockRefs'
  | 'blockRc'
  | 'rebalance'
  | { scrub: string }
  | 'aliases'
  | 'clearResyncQueue'

interface LaunchRepairOperationRequestBody {
  repairType: RepairType
}

interface LaunchRepairOperationResp {
  success: Record<string, null>
  error: Record<string, string>
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const { node } = getQuery<LaunchRepairOperationParams>(event)

  if (!node) {
    logger.debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<LaunchRepairOperationRequestBody>(event)

  if (!body || !body.repairType) {
    logger.debug('Repair type is required')
    throw new HTTPError({ status: 400, statusText: 'Repair type is required' })
  }

  logger.withMetadata({ node, repairType: body.repairType }).info('Launching repair operation')
  const data = await gfetch<LaunchRepairOperationResp>('/v2/LaunchRepairOperation', {
    method: 'POST',
    params: { node },
    body
  })

  return { status: 'success', message: 'Launch Repair Operation', data }
})
