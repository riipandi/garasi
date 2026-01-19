import type { Generated } from 'kysely'

export interface UserTable {
  id: Generated<number>
  email: string
  name: string
  password_hash: string
  created_at?: number
  updated_at?: number
}
