import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface UpdateProfileBody {
  name?: string
}

export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  try {
    // Parse request body
    const body = await readBody<UpdateProfileBody>(event)

    // Validate at least one field is provided
    if (!body || body.name === undefined || body.name === null || body.name.trim() === '') {
      throw new HTTPError({ status: 400, statusText: 'Name is required' })
    }

    // Validate name length
    if (body.name.length < 2) {
      throw new HTTPError({ status: 400, statusText: 'Name must be at least 2 characters' })
    }

    if (body.name.length > 100) {
      throw new HTTPError({ status: 400, statusText: 'Name must not exceed 100 characters' })
    }

    // Find user by ID
    const user = await db
      .selectFrom('users')
      .select(['id', 'name', 'email'])
      .where('id', '=', String(auth.userId))
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      throw new HTTPError({ status: 404, statusText: 'User not found' })
    }

    // Update user profile
    const updatedUser = await db
      .updateTable('users')
      .set({
        name: body.name.trim(),
        updated_at: Math.floor(Date.now() / 1000)
      })
      .where('id', '=', String(auth.userId))
      .returning(['id', 'email', 'name'])
      .executeTakeFirstOrThrow()

    // Return success message
    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        user_id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
