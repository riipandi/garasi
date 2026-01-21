import { defineHandler, HTTPError, getQuery, readBody } from 'nitro/h3'

interface GetWorkerInfoParams {
  node: string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

interface GetWorkerInfoReq {
  id: number // Worker ID
}

interface WorkerInfoResp {
  id: number
  name: string
  state: string
  errors: number
  consecutiveErrors: number
  freeform: string[]
  lastError: object | null
  persistentErrors: number | null
  progress: string | null
  queueLength: number | null
  tranquility: number | null
}

interface GetWorkerInfoResp {
  success: Record<string, WorkerInfoResp>
  error: Record<string, string>
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const { node } = getQuery<GetWorkerInfoParams>(event)

    if (!node) {
      logger.debug('Node parameter is required')
      throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
    }

    const body = await readBody<GetWorkerInfoReq>(event)

    if (!body || body.id === undefined || body.id === null) {
      logger.debug('Worker ID is required')
      throw new HTTPError({ status: 400, statusText: 'Worker ID is required' })
    }

    logger.withMetadata({ node, workerId: body.id }).info('Getting worker information')
    const data = await gfetch<GetWorkerInfoResp>('/v2/GetWorkerInfo', {
      method: 'POST',
      params: { node },
      body
    })

    return { status: 'success', message: 'Get Worker Info', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
