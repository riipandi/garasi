import type { Generated } from 'kysely'

export interface PasswordResetTokenTable {
  id: Generated<number>
  user_id: number
  token: string
  expires_at: number
  used: number
  created_at?: number
}
