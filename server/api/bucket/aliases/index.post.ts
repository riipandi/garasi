import { defineHandler } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch } = event.context
  const data = await gfetch('/v2/ListBuckets')

  return { status: 'success', message: 'Add Bucket Alias', data }
})
