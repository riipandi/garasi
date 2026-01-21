import { HTTPError, getQuery, getRouterParam } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface InspectObjectParams {
  key: string // Key of the object to inspect
}

interface InspectObjectBlock {
  partNumber: number // Part number of the part containing this block
  offset: number // Offset of this block within the part
  hash: string // Hash (blake2 sum) of the block's data
  size: number // Length of the block's data
}

interface InspectObjectVersion {
  uuid: string // Version ID
  timestamp: string // Creation timestamp of this object version
  encrypted: boolean // Whether this object version was created with SSE-C encryption
  uploading: boolean // Whether this object version is still uploading
  aborted: boolean // Whether this is an aborted upload
  deleteMarker: boolean // Whether this version is a delete marker
  inline: boolean // Whether the object's data is stored inline
  etag?: string | null // Etag of this object version
  size?: number | null // Size of the object, in bytes
  headers?: Array<[string, string]> // Metadata (HTTP headers) associated with this object version
  blocks?: InspectObjectBlock[] // List of data blocks for this object version
}

interface InspectObjectResponse {
  bucketId: string // ID of bucket containing inspected object
  key: string // Key of the inspected object
  versions: InspectObjectVersion[] // List of versions currently stored for this object
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.debug('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const { key } = getQuery<InspectObjectParams>(event)

  if (!key) {
    logger.debug('Object key is required')
    throw new HTTPError({ status: 400, statusText: 'Object key is required' })
  }

  logger.withMetadata({ bucketId: id, key }).info('Inspecting object')
  const data = await gfetch<InspectObjectResponse>('/v2/InspectObject', {
    params: { bucketId: id, key }
  })

  if (!data) {
    return { success: false, message: 'Object not found', data: null }
  }

  return { status: 'success', message: 'Inspect Object', data }
})
