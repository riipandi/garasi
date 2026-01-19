import { defineHandler } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch } = event.context
  const message = await gfetch<string>('/health')

  return { message }
})
