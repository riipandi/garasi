import type { Generated } from 'kysely'

export interface EmailChangeTokenTable {
  id: Generated<string>
  user_id: string
  old_email: string
  new_email: string
  token: string
  expires_at: number
  used: number
  created_at?: number
}
