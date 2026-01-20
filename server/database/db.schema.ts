import type { Kysely } from 'kysely'
import type { PasswordResetTokenTable } from './schemas/password-reset-token'
import type { RefreshTokenTable } from './schemas/refresh-token'
import type { SessionTable } from './schemas/session'
import type { UserTable } from './schemas/user'

export interface AppDatabase {
  password_reset_tokens: PasswordResetTokenTable
  refresh_tokens: RefreshTokenTable
  sessions: SessionTable
  users: UserTable
}

// Export Kysely with generic constrained to your Database
export type DBContext<T extends AppDatabase = AppDatabase> = Kysely<T>
