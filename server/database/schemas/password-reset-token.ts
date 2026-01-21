import type { Generated } from 'kysely'

export interface PasswordResetTokenTable {
  id: Generated<string>
  userId: string
  token: string
  expiresAt: number
  used: number
  createdAt?: number
}
