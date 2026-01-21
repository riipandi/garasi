import type { Generated } from 'kysely'

export interface RefreshTokenTable {
  id: Generated<string>
  userId: string
  sessionId: string
  tokenHash: string
  expiresAt: number
  isRevoked: number
  revokedAt?: number
  createdAt?: number
}
