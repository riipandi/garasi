import type { Generated } from 'kysely'

export interface PasswordResetTokenTable {
  id: Generated<string>
  user_id: string
  token: string
  expires_at: number
  used: number
  created_at?: number
}
