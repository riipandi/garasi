import { HTTPError, getQuery, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

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

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

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
})
