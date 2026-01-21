import { defineHandler, HTTPError, getQuery, readBody } from 'nitro/h3'

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

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
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
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
