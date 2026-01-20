import { sql } from 'kysely'
import { typeid } from 'typeid-js'
import { UNIX_TIMESTAMP } from '../db.migrator'
import type { DBContext } from '../db.schema'

export async function up(db: DBContext): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('email', 'text', (col) => col.unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create index for faster lookups by email
  await db.schema.createIndex('idx_users_email').on('users').column('email').ifNotExists().execute()

  // Seed default admin user
  const passwordHash = await Bun.password.hash('P@ssw0rd!')
  const userId = typeid('user').toString()

  await db
    .insertInto('users')
    .values([
      { id: userId, name: 'Admin Sistem', email: 'admin@example.com', password_hash: passwordHash }
    ])
    .onConflict((oc) => oc.column('email').doNothing())
    .execute()
}

export async function down(db: DBContext): Promise<void> {
  await db.schema.dropTable('users').execute()
}
