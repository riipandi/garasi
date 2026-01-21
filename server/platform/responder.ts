import { NoResultError } from 'kysely'
import { H3Event, HTTPError, type EventHandlerResponse } from 'nitro/h3'
import { FetchError } from 'ofetch'
import { protectedEnv } from '~/shared/envars'

export function createErrorResonse<R = EventHandlerResponse>(
  event: H3Event,
  payload: any | unknown,
  logMessage?: string
) {
  const { logger } = event.context
  const { statusCode, message, error } = parseError(payload)
  event.res.status = statusCode // Set response HTTP status code

  logger
    .withMetadata({ statusCode, message })
    .withError(error)
    .error(logMessage ?? message)

  return { success: false, message, data: null, error } as R
}

export function parseError(err: any | unknown) {
  let statusCode = 500
  let message = 'Unknown error occurred'
  let error: any = null

  if (err instanceof HTTPError) {
    statusCode = err.status
    message = err.statusText || err.message || 'Unknown error occurred'
    error = {
      type: err.name,
      status: err.status,
      statusText: err.statusText,
      reason: err.message,
      ...formatStack(err)
    }
  } else if (err instanceof FetchError) {
    statusCode = err.statusCode || 500
    // Extract error details from response._data if available
    const responseData = err.response?._data
    if (responseData && responseData.message) {
      message = responseData.message
    } else {
      message = err.message || 'Unknown error occurred'
    }
    const { message: reason, ...respWithoutMessage } = responseData
    error = {
      type: err.name,
      statusCode: err.statusCode,
      reason: reason,
      ...formatStack(err),
      ...respWithoutMessage
    }
  } else if (err instanceof NoResultError) {
    statusCode = 404
    message = err.message || 'Resource not found'
    error = { type: err.name, reason: err.message, ...formatStack(err) }
  } else if (err instanceof Error) {
    message = err.message || 'Unknown error occurred'
    error = { type: err.name, reason: err.message, ...formatStack(err) }
  }

  return { statusCode, message, error }
}

function formatStack(err: any | unknown) {
  const includeStack = protectedEnv.APP_LOG_LEVEL === 'debug'
  return includeStack && { stack: err.stack ? err.stack.split('\n') : [] }
}
