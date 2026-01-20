import type { Generated } from 'kysely'

export interface UserTable {
  id: Generated<string>
  email: string
  name: string
  password_hash: string
  created_at?: number
  updated_at?: number
}
