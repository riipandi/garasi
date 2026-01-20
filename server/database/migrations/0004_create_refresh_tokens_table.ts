import { sql } from 'kysely'
import { UNIX_TIMESTAMP } from '../db.migrator'
import type { DBContext } from '../db.schema'

export async function up(db: DBContext): Promise<void> {
  await db.schema
    .createTable('refresh_tokens')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('session_id', 'text', (col) => col.notNull())
    .addColumn('token_hash', 'text', (col) => col.notNull().unique())
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('is_revoked', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('revoked_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addForeignKeyConstraint(
      'fk_refresh_tokens_session_id',
      ['session_id'],
      'sessions',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint('fk_refresh_tokens_user_id', ['user_id'], 'users', ['id'], (cb) =>
      cb.onDelete('cascade')
    )
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create index for faster lookups by user_id
  await db.schema
    .createIndex('idx_refresh_tokens_user_id')
    .on('refresh_tokens')
    .column('user_id')
    .ifNotExists()
    .execute()

  // Create index for faster lookups by session_id
  await db.schema
    .createIndex('idx_refresh_tokens_session_id')
    .on('refresh_tokens')
    .column('session_id')
    .ifNotExists()
    .execute()

  // Create index for faster lookups by token_hash
  await db.schema
    .createIndex('idx_refresh_tokens_token_hash')
    .on('refresh_tokens')
    .column('token_hash')
    .ifNotExists()
    .execute()

  // Create composite index for faster lookups by user_id and is_revoked
  await db.schema
    .createIndex('idx_refresh_tokens_user_revoked')
    .on('refresh_tokens')
    .columns(['user_id', 'is_revoked'])
    .ifNotExists()
    .execute()

  // Create composite index for faster lookups by session_id and is_revoked
  await db.schema
    .createIndex('idx_refresh_tokens_session_revoked')
    .on('refresh_tokens')
    .columns(['session_id', 'is_revoked'])
    .ifNotExists()
    .execute()

  // Create composite index for faster lookups by is_revoked and expires_at
  await db.schema
    .createIndex('idx_refresh_tokens_revoked_expires')
    .on('refresh_tokens')
    .columns(['is_revoked', 'expires_at'])
    .ifNotExists()
    .execute()
}

export async function down(db: DBContext): Promise<void> {
  await db.schema.dropTable('refresh_tokens').execute()
}
