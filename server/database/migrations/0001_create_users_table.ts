import { UNIX_TIMESTAMP } from '../db.migrator'
import type { DBContext } from '../db.schema'

export async function up(db: DBContext): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('email', 'text', (col) => col.unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .execute()

  const passwordHash = await Bun.password.hash('P@ssw0rd!')

  await db
    .insertInto('users')
    .values([{ name: 'Admin Sistem', email: 'admin@example.com', password_hash: passwordHash }])
    .execute()
}

export async function down(db: DBContext): Promise<void> {
  await db.schema.dropTable('users').execute()
}
