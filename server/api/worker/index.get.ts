import { HTTPError, getQuery, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface ListWorkersParams {
  node: string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

interface ListWorkersRequestBody {
  busyOnly?: boolean | null
  errorOnly?: boolean | null
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

interface ListWorkersResp {
  success: Record<string, WorkerInfoResp[]>
  error: Record<string, string>
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const { node } = getQuery<ListWorkersParams>(event)

  if (!node) {
    logger.debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<ListWorkersRequestBody>(event)
  const data = await gfetch<ListWorkersResp>('/v2/ListWorkers', {
    method: 'POST',
    params: { node },
    body
  })

  return { status: 'success', message: 'List Workers', data }
})
