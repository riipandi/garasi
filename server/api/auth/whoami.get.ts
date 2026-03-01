import { HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { WhoamiData } from '~/shared/schemas/user.schema'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  const user = await db
    .selectFrom('users')
    .select(['id', 'email', 'name'])
    .where('id', '=', auth.userId)
    .executeTakeFirst()

  if (!user) {
    logger.withMetadata({ userId: auth.userId }).warn('User not found')
    throw new HTTPError({ status: 404, statusText: 'User not found' })
  }

  logger
    .withMetadata({ userId: auth.userId, email: user.email })
    .debug('User information retrieved')

  return createResponse<WhoamiData>(event, 'User information retrieved', {
    data: {
      user_id: user.id,
      email: user.email,
      name: user.name
    }
  })
})
