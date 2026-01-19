import { createError, defineHandler, readBody } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { db } = event.context

  try {
    // Parse request body
    const body = await readBody<{
      email: string
      password: string
    }>(event)

    // Validate required fields
    if (!body?.email || !body?.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    // Find user by email
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'password_hash'])
      .where('email', '=', body.email)
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Verify password using Bun's password.verify
    const isPasswordValid = await Bun.password.verify(body.password, user.password_hash)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Return user data (excluding password_hash)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  } catch (error: any) {
    // Re-throw if it's already a H3 error
    if (error.statusCode) {
      throw error
    }

    // Handle unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
