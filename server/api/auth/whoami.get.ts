import { HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  // Fetch user from database
  const user = await db
    .selectFrom('users')
    .select(['id', 'email', 'name'])
    .where('id', '=', auth.userId)
    .executeTakeFirst()

  // Check if user exists
  if (!user) {
    throw new HTTPError({ status: 404, statusText: 'User not found' })
  }

  // Return user information
  return {
    success: true,
    message: 'User information retrieved',
    data: {
      user_id: user.id,
      email: user.email,
      name: user.name
    }
  }
})
