import { HTTPError, readBody } from 'nitro/h3'
import { typeid } from 'typeid-js'
import { defineProtectedHandler } from '~/server/platform/guards'
import { sendMail } from '~/server/platform/mailer'
import { createErrorResonse } from '~/server/platform/responder'
import { protectedEnv } from '~/shared/envars'

interface ChangeEmailBody {
  new_email: string
  password: string
}

export default defineProtectedHandler(async (event) => {
  const { db, auth, baseURL } = event.context

  try {
    // Parse request body
    const body = await readBody<ChangeEmailBody>(event)

    // Validate required fields
    if (!body?.new_email || !body?.password) {
      throw new HTTPError({ status: 400, statusText: 'New email and password are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.new_email)) {
      throw new HTTPError({ status: 400, statusText: 'Invalid email format' })
    }

    // Normalize email (lowercase)
    const normalizedNewEmail = body.new_email.toLowerCase().trim()

    // Find current user
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'passwordHash'])
      .where('id', '=', auth.userId)
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      throw new HTTPError({ status: 404, statusText: 'User not found' })
    }

    // Verify password
    const isPasswordValid = await Bun.password.verify(body.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new HTTPError({ status: 401, statusText: 'Incorrect password' })
    }

    // Check if new email is the same as current email
    if (normalizedNewEmail === user.email) {
      throw new HTTPError({
        status: 400,
        statusText: 'New email cannot be the same as current email'
      })
    }

    // Check if new email is already in use by another user
    const existingUser = await db
      .selectFrom('users')
      .select(['id'])
      .where('email', '=', normalizedNewEmail)
      .executeTakeFirst()

    if (existingUser) {
      throw new HTTPError({ status: 409, statusText: 'Email is already in use by another account' })
    }

    // Check if there's already a pending email change request for this user
    const pendingRequest = await db
      .selectFrom('email_change_tokens')
      .select(['id', 'expiresAt'])
      .where('userId', '=', user.id)
      .where('used', '=', 0)
      .where('expiresAt', '>', Math.floor(Date.now() / 1000))
      .executeTakeFirst()

    if (pendingRequest) {
      throw new HTTPError({
        status: 400,
        statusText:
          'You already have a pending email change request. Please wait for it to expire or use the confirmation link sent to your email.'
      })
    }

    // Generate a secure token and set expiry to 24 hours from now (in seconds)
    const token = crypto.randomUUID()
    const expiresAt = Math.floor(Date.now() / 1000) + 86400 // 24 hours

    // Store the email change token
    await db
      .insertInto('email_change_tokens')
      .values({
        id: typeid('email_change_token').toString(),
        userId: user.id,
        oldEmail: user.email,
        newEmail: normalizedNewEmail,
        token,
        expiresAt: expiresAt,
        used: 0
      })
      .execute()

    const isDev = protectedEnv.APP_MODE === 'development'
    const confirmLink = `${baseURL}/confirm-email-change?token=${token}`

    // Send confirmation email to the NEW email address
    await sendMail({
      to: normalizedNewEmail,
      subject: 'Confirm your email change',
      html: `
        <h2>Email Change Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to change your email address from <strong>${user.email}</strong> to <strong>${normalizedNewEmail}</strong>.</p>
        <p>Please click the link below to confirm this change:</p>
        <p><a href="${confirmLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Confirm Email Change</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${confirmLink}</p>
        <p><strong>Important:</strong> This link will expire in 24 hours. If you did not request this change, please ignore this email.</p>
      `
    })

    return {
      success: true,
      message:
        'A confirmation email has been sent to your new email address. Please check your inbox and click the link to confirm the email change.',
      data: isDev ? { token, confirm_link: confirmLink, expires_at: expiresAt } : null
    }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
