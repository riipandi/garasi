import { defineHandler, HTTPError, readBody } from 'nitro/h3'

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
      throw new HTTPError({ status: 400, statusText: 'Email and password are required' })
    }

    // Find user by email
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'password_hash'])
      .where('email', '=', body.email)
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      throw new HTTPError({ status: 400, statusText: 'Invalid credentials' })
    }

    // Verify password using Bun's password.verify
    const isPasswordValid = await Bun.password.verify(body.password, user.password_hash)

    if (!isPasswordValid) {
      throw new HTTPError({ status: 400, statusText: 'Invalid credentials' })
    }

    // Return user data (excluding password_hash)
    return { success: true, user }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { status: 'error', message, errors }
  }
})
