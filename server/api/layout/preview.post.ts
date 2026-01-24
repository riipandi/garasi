import { HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { PreviewLayoutChangesResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const data = await gfetch<PreviewLayoutChangesResponse>('/v2/PreviewClusterLayoutChanges', {
    method: 'POST'
  })
  logger.withMetadata(data).debug('Previewing cluster layout changes')

  if (!data.message) {
    throw new HTTPError({
      status: 400,
      statusText: data.error || 'Failed to preview layout changes'
    })
  }

  return createResponse<PreviewLayoutChangesResponse>(event, 'Preview Cluster Layout Changes', {
    data
  })
})
