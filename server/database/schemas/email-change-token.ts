import type { Generated } from 'kysely'

export interface EmailChangeTokenTable {
  id: Generated<string>
  userId: string
  oldEmail: string
  newEmail: string
  token: string
  expiresAt: number
  used: number
  createdAt?: number
}
