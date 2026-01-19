import { UNIX_TIMESTAMP } from '../db.migrator'
import type { DBContext } from '../db.schema'

export async function up(db: DBContext): Promise<void> {
  await db.schema
    .createTable('password_reset_tokens')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('used', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .execute()
}

export async function down(db: DBContext): Promise<void> {
  await db.schema.dropTable('password_reset_tokens').execute()
}
