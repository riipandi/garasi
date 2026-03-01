import { defineHandler, getQuery, HTTPError } from 'nitro/h3'
import { createResponse, createErrorResonse } from '~/server/platform/responder'
import type { ValidateTokenResponse } from '~/shared/schemas/user.schema'

export default defineHandler(async (event) => {
  const { db } = event.context

  try {
    const { token } = getQuery<{ token: string }>(event)

    if (!token || token.trim() === '') {
      throw new HTTPError({ status: 400, statusText: 'Token is required' })
    }

    const resetToken = await db
      .selectFrom('password_reset_tokens')
      .selectAll()
      .where('token', '=', token)
      .executeTakeFirst()

    if (!resetToken) {
      throw new HTTPError({ status: 401, statusText: 'Invalid or expired token' })
    }

    const now = Math.floor(Date.now() / 1000)
    if (resetToken.expiresAt < now) {
      throw new HTTPError({ status: 401, statusText: 'Invalid or expired token' })
    }

    if (resetToken.used !== 0) {
      throw new HTTPError({ status: 401, statusText: 'Token has already been used' })
    }

    return createResponse<ValidateTokenResponse>(event, 'Token valid', {
      statusCode: 200,
      data: { valid: true }
    })
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
