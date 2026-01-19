import { defineHandler } from 'nitro/h3'

interface ListBucketsResp {
  id: string
  created: string
  globalAliases: string[]
  localAliases: string[]
}

export default defineHandler(async (event) => {
  const { gfetch } = event.context
  const data = await gfetch<ListBucketsResp>('/v2/ListBuckets')

  return { message: 'List Buckets', data }
})
