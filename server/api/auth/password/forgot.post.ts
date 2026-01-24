import { defineEventHandler, readBody, HTTPError } from 'h3'
import { typeid } from 'typeid-js'
import { sendMail } from '~/server/platform/mailer'
import { createErrorResonse } from '~/server/platform/responder'
import { protectedEnv } from '~/shared/envars'

interface ForgotPasswordBody {
  email: string
}

export default defineEventHandler(async (event) => {
  const { db, baseURL, logger } = event.context

  try {
    // Parse request body
    const body = await readBody<ForgotPasswordBody>(event)

    // Validate required fields
    if (!body || !body.email) {
      logger.warn('Email is required')
      throw new HTTPError({ status: 400, statusText: 'Email is required' })
    }

    logger.withMetadata({ email: body.email }).debug('Processing forgot password request')

    // Find user by email
    const user = await db
      .selectFrom('users')
      .select(['id', 'email'])
      .where('email', '=', body.email)
      .executeTakeFirst()

    // Always return success to prevent email enumeration
    // Even if user doesn't exist, we don't want to reveal that
    if (!user) {
      logger
        .withMetadata({ email: body.email })
        .warn('User not found, but returning success for security')
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      }
    }

    // Generate a secure token and set expiry to 1 hour from now (in seconds)
    const token = crypto.randomUUID()
    const expiresAt = Math.floor(Date.now() / 1000) + 3600

    // Store the reset token
    await db
      .insertInto('password_reset_tokens')
      .values({
        id: typeid('password_reset_token').toString(),
        userId: user.id,
        token,
        expiresAt: expiresAt,
        used: 0
      })
      .execute()

    const isDev = protectedEnv.APP_MODE === 'development'
    const resetLink = `${baseURL}/reset-password/${token}`

    logger
      .withMetadata({ userId: user.id, email: user.email })
      .debug('Password reset token created')

    await sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `
        <p>Password reset token for ${user.email}: ${token}</p>
        <p>
          Password reset link: <a href="${resetLink}">${resetLink}</a>
        </p>
      `
    })

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      data: isDev ? { token, reset_link: resetLink, expires_at: expiresAt } : null
    }
  } catch (error) {
    logger.withError(error).error('Error processing forgot password request')
    return createErrorResonse(event, error)
  }
})
