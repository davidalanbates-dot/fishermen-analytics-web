import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_game_icon" AS ENUM('analytics', 'seo', 'creative', 'video', 'web', 'social', 'media');
  CREATE TYPE "public"."enum__services_v_version_game_icon" AS ENUM('analytics', 'seo', 'creative', 'video', 'web', 'social', 'media');
  ALTER TABLE "services" ADD COLUMN "game_icon" "enum_services_game_icon" DEFAULT 'analytics';
  ALTER TABLE "_services_v" ADD COLUMN "version_game_icon" "enum__services_v_version_game_icon" DEFAULT 'analytics';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DROP COLUMN "game_icon";
  ALTER TABLE "_services_v" DROP COLUMN "version_game_icon";
  DROP TYPE "public"."enum_services_game_icon";
  DROP TYPE "public"."enum__services_v_version_game_icon";`)
}
