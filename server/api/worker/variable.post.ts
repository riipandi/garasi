import { defineHandler, HTTPError, getQuery, readBody } from 'nitro/h3'

interface SetWorkerVariableParams {
  node: string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

interface SetWorkerVariableReq {
  variable: string // Variable name
  value: string // Variable value
}

interface SetWorkerVariableResp {
  success: Record<string, { variable: string; value: string }>
  error: Record<string, string>
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const { node } = getQuery<SetWorkerVariableParams>(event)

    if (!node) {
      logger.debug('Node parameter is required')
      throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
    }

    const body = await readBody<SetWorkerVariableReq>(event)

    if (!body?.variable || !body?.value) {
      logger.debug('Variable name and value are required')
      throw new HTTPError({ status: 400, statusText: 'Variable name and value are required' })
    }

    logger
      .withMetadata({ node, variable: body.variable, value: body.value })
      .info('Setting worker variable')
    const data = await gfetch<SetWorkerVariableResp>('/v2/SetWorkerVariable', {
      method: 'POST',
      params: { node },
      body
    })

    return { status: 'success', message: 'Set Worker Variable', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
