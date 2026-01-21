import { defineHandler, HTTPError, getQuery, readBody } from 'nitro/h3'

interface BlockVersion {
  versionId: string
  refDeleted: boolean
  versionDeleted: boolean
  garbageCollected: boolean
  backlink: object | null
}

interface GetBlockInfoResp {
  blockHash: string
  refcount: number
  versions: BlockVersion[]
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const { node } = getQuery<{ node: string }>(event)

    if (!node) {
      logger.debug('Node parameter is required')
      throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
    }

    const body = await readBody<{ blockHash: string }>(event)

    if (!body?.blockHash) {
      logger.debug('Block hash is required')
      throw new HTTPError({ status: 400, statusText: 'Block hash is required' })
    }

    logger.withMetadata({ node, blockHash: body.blockHash }).info('Getting block info')
    const data = await gfetch<GetBlockInfoResp>('/v2/GetBlockInfo', {
      method: 'POST',
      params: { node },
      body
    })

    return { status: 'success', message: 'Get Block Info', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
