import type { Generated } from 'kysely'

export interface SessionTable {
  id: Generated<string>
  user_id: string
  ip_address: string
  user_agent: string
  device_info: string
  is_active: number
  last_activity_at: number
  expires_at: number
  created_at?: number
  updated_at?: number
}
