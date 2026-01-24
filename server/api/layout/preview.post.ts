import { HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { PreviewLayoutChangesResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('PreviewClusterLayout')

  log.debug('Previewing cluster layout changes')
  const data = await gfetch<PreviewLayoutChangesResponse>('/v2/PreviewClusterLayoutChanges', {
    method: 'POST'
  })

  if (!data.message) {
    log.withMetadata({ error: data.error }).warn('Failed to preview layout changes')
    throw new HTTPError({
      status: 400,
      statusText: data.error || 'Failed to preview layout changes'
    })
  }

  return createResponse<PreviewLayoutChangesResponse>(event, 'Preview Cluster Layout Changes', {
    data
  })
})
