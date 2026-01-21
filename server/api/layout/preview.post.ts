import { defineHandler, HTTPError } from 'nitro/h3'

interface ZoneRedundancy {
  atLeast?: number | null
  maximum?: string | null
}

interface LayoutParameters {
  zoneRedundancy: ZoneRedundancy
}

interface LayoutNodeRole {
  id: string
  zone: string
  tags: string[]
  capacity: number | null
  storedPartitions: number | null
  usableCapacity: number | null
}

interface NodeRoleChange {
  id: string
  remove?: boolean
  zone?: string
  tags?: string[]
  capacity?: number | null
}

interface GetClusterLayoutResp {
  version: number
  roles: LayoutNodeRole[]
  parameters: LayoutParameters
  partitionSize: number
  stagedRoleChanges: NodeRoleChange[]
  stagedParameters: LayoutParameters | null
}

interface PreviewClusterLayoutChangesRespSuccess {
  message: string[]
  newLayout: GetClusterLayoutResp
}

interface PreviewClusterLayoutChangesRespError {
  error: string
}

type PreviewClusterLayoutChangesResp =
  | PreviewClusterLayoutChangesRespSuccess
  | PreviewClusterLayoutChangesRespError

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Previewing cluster layout changes')
    const data = await gfetch<PreviewClusterLayoutChangesResp>('/v2/PreviewClusterLayoutChanges', {
      method: 'POST'
    })

    return { status: 'success', message: 'Preview Cluster Layout Changes', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
