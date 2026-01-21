import type { Generated } from 'kysely'

export interface SessionTable {
  id: Generated<string>
  userId: string
  ipAddress: string
  userAgent: string
  deviceInfo: string
  isActive: number
  lastActivityAt: number
  expiresAt: number
  createdAt?: number
  updatedAt?: number
}
