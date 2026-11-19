import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_role" AS ENUM('craft', 'data', 'search');
  CREATE TYPE "public"."enum__services_v_version_role" AS ENUM('craft', 'data', 'search');
  ALTER TABLE "services" ALTER COLUMN "core" DROP DEFAULT;
  ALTER TABLE "_services_v" ALTER COLUMN "version_core" DROP DEFAULT;
  ALTER TABLE "services" ADD COLUMN "role" "enum_services_role" DEFAULT 'craft';
  ALTER TABLE "services_locales" ADD COLUMN "data_layer" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "search_layer" varchar;
  ALTER TABLE "_services_v" ADD COLUMN "version_role" "enum__services_v_version_role" DEFAULT 'craft';
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_data_layer" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_search_layer" varchar;`)
  // Data Analytics and SEO/GEO become the two layers (they were the "core" services)
  await db.execute(sql`
   UPDATE "services" SET "role" = 'data' WHERE "slug" = 'data-analytics';
  UPDATE "services" SET "role" = 'search' WHERE "slug" = 'seo-geo';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ALTER COLUMN "core" SET DEFAULT false;
  ALTER TABLE "_services_v" ALTER COLUMN "version_core" SET DEFAULT false;
  ALTER TABLE "services" DROP COLUMN "role";
  ALTER TABLE "services_locales" DROP COLUMN "data_layer";
  ALTER TABLE "services_locales" DROP COLUMN "search_layer";
  ALTER TABLE "_services_v" DROP COLUMN "version_role";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_data_layer";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_search_layer";
  DROP TYPE "public"."enum_services_role";
  DROP TYPE "public"."enum__services_v_version_role";`)
}
