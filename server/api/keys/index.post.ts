import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse, createErrorResonse } from '~/server/platform/responder'
import type { CreateAccessKeyRequest, CreateAccessKeyResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('CreateKey')

  try {
    const body = await readBody<CreateAccessKeyRequest>(event)

    if (!body?.name || body.name.trim() === '') {
      log.warn('Name is required')
      throw new HTTPError({ status: 400, statusText: 'Name is required' })
    }

    log
      .withMetadata({ name: body.name, neverExpires: body.neverExpires })
      .debug('Creating access key')

    let expirationFormatted = body.neverExpires ? null : body.expiration || null

    // Convert date format to ISO 8601 with time set to 23:59:59 if expiration is provided
    if (expirationFormatted) {
      // Check if it's a date-only format (YYYY-MM-DD) without time
      if (/^\d{4}-\d{2}-\d{2}$/.test(expirationFormatted)) {
        // Set time to 23:59:59 for the selected date
        expirationFormatted = `${expirationFormatted}T23:59:59.000Z`
      } else if (expirationFormatted.includes('T') && !expirationFormatted.includes('Z')) {
        // If it's datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO 8601
        const date = new Date(expirationFormatted)
        if (!isNaN(date.getTime())) {
          expirationFormatted = date.toISOString()
        }
      }
    }

    const requestBody: CreateAccessKeyRequest = {
      name: body.name,
      expiration: expirationFormatted,
      allow: body.allow,
      deny: body.deny
    }

    const data = await gfetch<CreateAccessKeyResponse>('/v2/CreateKey', {
      method: 'POST',
      body: requestBody
    })

    log.withMetadata(data).debug('Access key created successfully')

    return createResponse<CreateAccessKeyResponse>(event, 'Access key created successfully', {
      statusCode: 201,
      data
    })
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
