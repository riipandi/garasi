import type { Generated } from 'kysely'

export interface UserTable {
  id: Generated<string>
  email: string
  name: string
  passwordHash: string
  createdAt?: number
  updatedAt?: number
}
