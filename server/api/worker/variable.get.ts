import { defineHandler, HTTPError, getQuery, readBody } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface GetWorkerVariableParams {
  node: string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

interface GetWorkerVariableRequestBody {
  variable?: string | null // Optional variable name
}

interface GetWorkerVariableResp {
  success: Record<string, Record<string, string>>
  error: Record<string, string>
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const { node } = getQuery<GetWorkerVariableParams>(event)

    if (!node) {
      logger.debug('Node parameter is required')
      throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
    }

    const body = await readBody<GetWorkerVariableRequestBody>(event)
    logger.withMetadata({ node, variable: body?.variable }).info('Getting worker variable')

    const data = await gfetch<GetWorkerVariableResp>('/v2/GetWorkerVariable', {
      method: 'POST',
      params: { node },
      body
    })

    return { status: 'success', message: 'Get Worker Variable', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
