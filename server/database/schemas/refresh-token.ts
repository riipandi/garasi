import type { Generated } from 'kysely'

export interface RefreshTokenTable {
  id: Generated<number>
  user_id: number
  session_id: number
  token_hash: string
  expires_at: number
  is_revoked: number
  revoked_at?: number
  created_at?: number
}
