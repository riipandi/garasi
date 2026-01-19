import { defineEventHandler, readBody, createError } from 'h3'
import { sendMail } from '~/server/platform/mailer'

interface ForgotPasswordBody {
  email: string
}

export default defineEventHandler(async (event) => {
  const { db, baseURL } = event.context

  try {
    // Parse request body
    const body = await readBody<ForgotPasswordBody>(event)

    // Validate required fields
    if (!body || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    // Find user by email
    const user = await db
      .selectFrom('users')
      .select(['id', 'email'])
      .where('email', '=', body.email)
      .executeTakeFirst()

    // Always return success to prevent email enumeration
    // Even if user doesn't exist, we don't want to reveal that
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      }
    }

    // Generate a secure random token
    const token = crypto.randomUUID()

    // Set token expiry to 1 hour from now
    const expiresAt = Math.floor(Date.now() / 1000) + 3600 // 1 hour in seconds

    // Store the reset token
    await db
      .insertInto('password_reset_tokens')
      .values({
        user_id: user.id,
        token,
        expires_at: expiresAt,
        used: 0
      })
      .execute()

    const passwordResetLink = `${baseURL}/reset-password/${token}`

    await sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `
        <p>Password reset token for ${user.email}: ${token}</p>
        <p>
          Password reset link: <a href="${passwordResetLink}">${passwordResetLink}</a>
        </p>
      `
    })

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      // Only include token in development
      ...(import.meta.env.DEV && { token, resetLink: `/reset-password?token=${token}` })
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
