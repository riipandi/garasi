import { NoResultError } from 'kysely'
import { H3Event, HTTPError } from 'nitro/h3'
import { FetchError } from 'ofetch'

export function createErrorResonse(event: H3Event, error: any | unknown, logMessage?: string) {
  const { logger } = event.context
  const { statusCode, message, errors } = parseError(error)
  event.res.status = statusCode // Set response HTTP status code

  logger
    .withMetadata({ statusCode, message })
    .withError(error)
    .error(logMessage ?? message)

  return {
    success: false,
    message,
    data: null,
    errors
  }
}

export function parseError(error: any | unknown) {
  let statusCode = 500
  let message = 'Unknown error'
  let errors: any = null

  if (error instanceof HTTPError) {
    statusCode = error.status
    message = error.statusText || error.message || 'Unknown error'
    errors = {
      type: 'HTTPError',
      status: error.status,
      statusText: error.statusText,
      reason: error.message,
      stack: error.stack ? error.stack.split('\n') : []
    }
  } else if (error instanceof FetchError) {
    statusCode = error.statusCode || 500
    // Extract error details from response._data if available
    const responseData = error.response?._data
    if (responseData && responseData.message) {
      message = responseData.message
    } else {
      message = error.message || 'Unknown error'
    }
    errors = {
      type: 'FetchError',
      statusCode: error.statusCode,
      reason: error.message,
      stack: error.stack ? error.stack.split('\n') : [],
      ...(responseData && {
        code: responseData.code,
        region: responseData.region,
        path: responseData.path
      })
    }
  } else if (error instanceof NoResultError) {
    statusCode = 404
    message = error.message || 'Resource not found'
    errors = {
      type: 'NoResultError',
      reason: error.message,
      stack: error.stack ? error.stack.split('\n') : []
    }
  } else if (error instanceof Error) {
    message = error.message || 'Unknown error'
    errors = {
      type: 'Error',
      reason: error.message,
      stack: error.stack ? error.stack.split('\n') : []
    }
  }

  return { statusCode, message, errors }
}
