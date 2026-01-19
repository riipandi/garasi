import { defineHandler, HTTPError } from 'nitro/h3'

interface ListBucketsResp {
  id: string
  created: string
  globalAliases: string[]
  localAliases: string[]
}

export default defineHandler(async (event) => {
  const { gfetch } = event.context

  try {
    const data = await gfetch<ListBucketsResp>('/v2/ListBuckets')
    if (!data) {
      throw new HTTPError({ status: 404, statusText: 'No bucket available' })
    }

    return { status: 'success', message: 'List Buckets', data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { status: 'error', message, errors }
  }
})
