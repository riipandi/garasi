import type { Kysely } from 'kysely'
import type { PasswordResetTokenTable } from './schemas/password-reset-token'
import type { UserTable } from './schemas/user'

export interface AppDatabase {
  users: UserTable
  password_reset_tokens: PasswordResetTokenTable
}

// Export Kysely with generic constrained to your Database
export type DBContext<T extends AppDatabase = AppDatabase> = Kysely<T>
