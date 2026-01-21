import { defineHandler } from 'nitro/h3'
import { createErrorResonse } from '../platform/responder'

export default defineHandler(async (event) => {
  const { gfetch } = event.context
  try {
    const data = await gfetch<string>('/health')
    const message = data.substring(0, data.indexOf('\n'))
    return { status: 'success', message }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
