import { createMessage } from '@upyo/core'
import { SmtpTransport } from '@upyo/smtp'
import { protectedEnv } from '~/shared/envars'

// Check if SMTP auth credentials are provided and valid
const smtpUsername = protectedEnv.MAILER_SMTP_USERNAME
const smtpPassword = protectedEnv.MAILER_SMTP_PASSWORD
const hasValidAuth =
  typeof smtpUsername === 'string' &&
  smtpUsername.trim() !== '' &&
  typeof smtpPassword === 'string' &&
  smtpPassword.trim() !== ''

const smtpTransport = new SmtpTransport({
  host: protectedEnv.MAILER_SMTP_HOST,
  port: protectedEnv.MAILER_SMTP_PORT,
  secure: protectedEnv.MAILER_SMTP_SECURE,
  auth: hasValidAuth
    ? {
        user: smtpUsername,
        pass: smtpPassword,
        method: 'plain'
      }
    : undefined
})

export interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

// Replace verbose sendMail with simpler implementation
class MailSendError extends Error {
  public override cause?: Error
  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'MailSendError'
    this.cause = cause
  }
}

async function sendMail(payload: EmailPayload): Promise<string> {
  const senderName = protectedEnv.MAILER_FROM_NAME
  const senderEmail = protectedEnv.MAILER_FROM_EMAIL
  const mailFrom = `${senderName} <${senderEmail}>`

  const message = createMessage({
    from: mailFrom,
    to: payload.to,
    subject: payload.subject,
    content: {
      html: payload.html,
      text: payload.text
    }
  })

  try {
    const receipt = await smtpTransport.send(message)

    if (!receipt.successful) {
      const err = new Error(
        (receipt.errorMessages ?? []).join('; ') || 'SMTP transport reported failure'
      )
      throw new MailSendError('Failed to send email via SMTP transport', err)
    }

    if (!receipt.messageId) {
      throw new MailSendError('SMTP did not return a messageId', undefined)
    }

    return receipt.messageId
  } catch (err: any) {
    if (err instanceof MailSendError) throw err
    throw new MailSendError(err?.message ?? 'SMTP send error', err)
  } finally {
    try {
      await smtpTransport.closeAllConnections()
    } catch {
      // ignore close errors
    }
  }
}

export { smtpTransport, sendMail }
