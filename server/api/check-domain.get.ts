import { defineHandler, getQuery, HTTPError } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch } = event.context

  try {
    // Validate required parameter
    const { domain } = getQuery<{ domain: string }>(event)
    if (!domain) {
      throw new HTTPError({ status: 400, statusText: 'Missing domain parameter' })
    }

    const data = await gfetch('/check', {
      query: { domain }
    })

    return { status: 'success', message: 'Check Domain', data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { status: 'error', message, errors }
  }
})
