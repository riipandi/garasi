import { sql } from 'kysely'
import { UNIX_TIMESTAMP } from '../db.migrator'
import type { DBContext } from '../db.schema'

export async function up(db: DBContext): Promise<void> {
  await db.schema
    .createTable('email_change_tokens')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('old_email', 'text', (col) => col.notNull())
    .addColumn('new_email', 'text', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('used', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create index for faster lookups by user_id
  await db.schema
    .createIndex('idx_email_change_tokens_user_id')
    .on('email_change_tokens')
    .column('user_id')
    .ifNotExists()
    .execute()

  // Create index for faster lookups by token
  await db.schema
    .createIndex('idx_email_change_tokens_token')
    .on('email_change_tokens')
    .column('token')
    .ifNotExists()
    .execute()

  // Create index for faster lookups by expires_at
  await db.schema
    .createIndex('idx_email_change_tokens_expires_at')
    .on('email_change_tokens')
    .column('expires_at')
    .ifNotExists()
    .execute()
}

export async function down(db: DBContext): Promise<void> {
  await db.schema.dropTable('email_change_tokens').execute()
}
