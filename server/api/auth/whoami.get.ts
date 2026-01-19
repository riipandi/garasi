import { defineHandler, HTTPError } from 'nitro/h3'

export default defineHandler(async (event) => {
  try {
    return { success: true, message: 'User information retrieved', data: null }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { status: 'error', message, errors }
  }
})
