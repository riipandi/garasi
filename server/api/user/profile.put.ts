import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { UpdateProfileResponse } from '~/shared/schemas/user.schema'

interface UpdateProfileBody {
  name?: string
}

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  const body = await readBody<UpdateProfileBody>(event)

  if (!body || body.name === undefined || body.name === null || body.name.trim() === '') {
    logger.warn('Name is required')
    throw new HTTPError({ status: 400, statusText: 'Name is required' })
  }

  if (body.name.length < 2) {
    logger.warn('Name must be at least 2 characters')
    throw new HTTPError({ status: 400, statusText: 'Name must be at least 2 characters' })
  }

  if (body.name.length > 100) {
    logger.warn('Name must not exceed 100 characters')
    throw new HTTPError({ status: 400, statusText: 'Name must not exceed 100 characters' })
  }

  logger.withMetadata({ userId: auth.userId, name: body.name }).debug('Updating user profile')

  const user = await db
    .selectFrom('users')
    .select(['id', 'name', 'email'])
    .where('id', '=', auth.userId)
    .executeTakeFirst()

  if (!user) {
    logger.withMetadata({ userId: auth.userId }).warn('User not found')
    throw new HTTPError({ status: 404, statusText: 'User not found' })
  }

  const updatedUser = await db
    .updateTable('users')
    .set({
      name: body.name.trim(),
      updatedAt: Math.floor(Date.now() / 1000)
    })
    .where('id', '=', auth.userId)
    .returning(['id', 'email', 'name'])
    .executeTakeFirstOrThrow()

  logger
    .withMetadata({ userId: auth.userId, name: updatedUser.name })
    .info('Profile updated successfully')

  return createResponse<UpdateProfileResponse>(event, 'Profile updated successfully', {
    statusCode: 200,
    data: {
      user_id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name
    }
  })
})
