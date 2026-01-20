import type { Generated } from 'kysely'

export interface RefreshTokenTable {
  id: Generated<string>
  user_id: string
  session_id: string
  token_hash: string
  expires_at: number
  is_revoked: number
  revoked_at?: number
  created_at?: number
}
