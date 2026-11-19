import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DROP COLUMN "core";
  ALTER TABLE "_services_v" DROP COLUMN "version_core";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ADD COLUMN "core" boolean;
  ALTER TABLE "_services_v" ADD COLUMN "version_core" boolean;`)
}
