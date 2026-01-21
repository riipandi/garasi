import { defineHandler } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch } = event.context
  const data = await gfetch('/metrics')

  return { status: 'success', message: 'Get Metrics', data }
})
