DO $$ BEGIN
 CREATE TYPE "catalog_item_query_type" AS ENUM('PRIVATE', 'PUBLIC', 'SHARED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "currency" AS ENUM('USD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "gender" AS ENUM('FEMALE', 'MALE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "hold_status" AS ENUM('ACTIVE', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "marc_file_duplicate_barcode_behavior" AS ENUM('SET_NULL', 'SKIP');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "marc_file_import_status" AS ENUM('PENDING', 'PARSING', 'COMPLETE', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "org_role" AS ENUM('ADMIN', 'STAFF', 'CLERK');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "patron_query_type" AS ENUM('PRIVATE', 'SHARED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "patron_sync_status" AS ENUM('PENDING', 'PARSING', 'COMPLETE', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"access_token" text,
	"expires_at" integer,
	"id_token" text,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"scope" text,
	"session_state" text,
	"token_type" text,
	"type" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_author" (
	"book_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"index" integer NOT NULL,
	"library_id" text NOT NULL,
	"name" text NOT NULL,
	"relation" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_edition_copy" (
	"book_id" text NOT NULL,
	"call_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edition_id" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_edition" (
	"book_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"isbn_10" text,
	"isbn_13" text,
	"page_count" integer,
	"published_year" integer,
	"publisher_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_reading_program" (
	"book_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL,
	"name" text NOT NULL,
	"note" text,
	"point_value" real,
	"reading_level" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_topic" (
	"book_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"item_id" text PRIMARY KEY NOT NULL,
	"reading_grade" real,
	"series_entry" text,
	"series_name" text,
	"summary" text,
	"target_age_max" integer,
	"target_age_min" integer,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog_item_collection_assignment" (
	"collection_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"item_id" text NOT NULL,
	CONSTRAINT "catalog_item_collection_assignment_collection_id_item_id_pk" PRIMARY KEY("collection_id","item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog_item_collection" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL,
	"name" text NOT NULL,
	"policy_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog_item_copy" (
	"acquisition_date" date,
	"barcode" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" text NOT NULL,
	"library_id" text NOT NULL,
	"location" text,
	"purchase_price_amount" real,
	"currency" "currency" DEFAULT 'USD' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog_item_policy" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"extension_limit" integer,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL,
	"loan_period_days" integer,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog_item_query" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"query" json NOT NULL,
	"catalog_item_query_type" "catalog_item_query_type" DEFAULT 'PRIVATE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog_item" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkout_restriction" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"item_policy_id" text NOT NULL,
	"library_id" text NOT NULL,
	"patron_policy_id" text NOT NULL,
	CONSTRAINT "checkout_restriction_item_policy_id_patron_policy_id_pk" PRIMARY KEY("item_policy_id","patron_policy_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkout" (
	"copy_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"patron_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hold" (
	"copy_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" text NOT NULL,
	"library_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"patron_id" text NOT NULL,
	"hold_status" "hold_status" DEFAULT 'ACTIVE' NOT NULL,
	CONSTRAINT "hold_copy_id_unique" UNIQUE("copy_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "holiday" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"date" date,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"default_concurrent_loan_limit" integer DEFAULT 10 NOT NULL,
	"default_extension_limit" integer DEFAULT 1 NOT NULL,
	"default_loan_period_days" integer DEFAULT 10 NOT NULL,
	"exclude_holidays_weekends" boolean DEFAULT true NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_checkout_ceiling" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"library_id" text PRIMARY KEY NOT NULL,
	"to_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_patron_policy" (
	"concurrent_loan_limit" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"extension_limit" integer,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL,
	"loan_period_days" integer,
	"name" text NOT NULL,
	"organization_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marc_file_import" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"duplicate_barcode_behavior" "marc_file_duplicate_barcode_behavior" NOT NULL,
	"file_key" text NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"library_id" text NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" "marc_file_import_status" DEFAULT 'PENDING' NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "one_roster_integration_config" (
	"base_url" text NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" text PRIMARY KEY NOT NULL,
	"token_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_invite" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"normalized_email" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" "org_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_user" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"role" "org_role" NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "organization_user_organization_id_user_id_pk" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"how_heard" text,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patron_group_assignment" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"group_id" text NOT NULL,
	"one_roster_sourced_id" text,
	"organization_id" text NOT NULL,
	"patron_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patron_group_library_policy_assignment" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"group_id" text NOT NULL,
	"library_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"policy_id" text NOT NULL,
	CONSTRAINT "patron_group_library_policy_assignment_group_id_policy_id_pk" PRIMARY KEY("group_id","policy_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patron_group" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"one_roster_sourced_id" text,
	"organization_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patron_import" (
	"classes_file_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"demographics_file_key" text,
	"enrollments_file_key" text,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"sync_id" text NOT NULL,
	"users_file_key" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patron_query" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"query" json NOT NULL,
	"type" "patron_query_type" DEFAULT 'PRIVATE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patron_sync" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"groups_added" integer NOT NULL,
	"groups_deleted" integer NOT NULL,
	"groups_updated" integer NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"patron_group_assignments_added" integer NOT NULL,
	"patron_group_assignments_deleted" integer NOT NULL,
	"patrons_added" integer NOT NULL,
	"patrons_deleted" integer NOT NULL,
	"patrons_updated" integer NOT NULL,
	"status" "patron_sync_status" DEFAULT 'PENDING'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patron" (
	"barcode" text NOT NULL,
	"birth_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"email" text,
	"first_name" text NOT NULL,
	"gender" "gender",
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"last_name" text NOT NULL,
	"one_roster_sourced_id" text,
	"organization_id" text NOT NULL,
	"preferred_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"expires" timestamp NOT NULL,
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"expires" timestamp NOT NULL,
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_author_name_library_id_index" ON "book_author" ("name","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_edition_id_book_id_index" ON "book_edition" ("id","book_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_reading_program_name_library_id_index" ON "book_reading_program" ("name","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_topic_name_library_id_index" ON "book_topic" ("name","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_collection_name_library_id_index" ON "catalog_item_collection" ("name","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_copy_barcode_library_id_index" ON "catalog_item_copy" ("barcode","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_copy_id_item_id_index" ON "catalog_item_copy" ("id","item_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_copy_id_library_id_index" ON "catalog_item_copy" ("id","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_policy_id_library_id_index" ON "catalog_item_policy" ("id","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_policy_name_library_id_index" ON "catalog_item_policy" ("name","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_query_name_library_id_owner_id_index" ON "catalog_item_query" ("name","library_id","owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_id_library_id_index" ON "catalog_item" ("id","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hold_item_id_patron_id_index" ON "hold" ("item_id","patron_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_id_organization_id_index" ON "library" ("id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_name_organization_id_index" ON "library" ("name","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_patron_policy_id_library_id_index" ON "library_patron_policy" ("id","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "library_patron_policy_name_library_id_index" ON "library_patron_policy" ("name","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organization_invite_normalized_email_organization_id_index" ON "organization_invite" ("normalized_email","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patron_group_assignment_one_roster_sourced_id_organization_id_index" ON "patron_group_assignment" ("one_roster_sourced_id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patron_group_id_organization_id_index" ON "patron_group" ("id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patron_group_name_organization_id_index" ON "patron_group" ("name","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patron_group_one_roster_sourced_id_organization_id_index" ON "patron_group" ("one_roster_sourced_id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patron_sync_id_organization_id_index" ON "patron_sync" ("id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patron_barcode_organization_id_index" ON "patron" ("barcode","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patron_id_organization_id_index" ON "patron" ("id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "patron_one_roster_sourced_id_organization_id_index" ON "patron" ("one_roster_sourced_id","organization_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_author" ADD CONSTRAINT "book_author_book_id_book_item_id_fk" FOREIGN KEY ("book_id") REFERENCES "book"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_author" ADD CONSTRAINT "book_author_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_author" ADD CONSTRAINT "book_author_book_id_library_id_catalog_item_id_library_id_fk" FOREIGN KEY ("book_id","library_id") REFERENCES "catalog_item"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition_copy" ADD CONSTRAINT "book_edition_copy_book_id_book_item_id_fk" FOREIGN KEY ("book_id") REFERENCES "book"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition_copy" ADD CONSTRAINT "book_edition_copy_book_id_id_catalog_item_copy_item_id_id_fk" FOREIGN KEY ("book_id","id") REFERENCES "catalog_item_copy"("item_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition_copy" ADD CONSTRAINT "book_edition_copy_book_id_edition_id_book_edition_book_id_id_fk" FOREIGN KEY ("book_id","edition_id") REFERENCES "book_edition"("book_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition" ADD CONSTRAINT "book_edition_book_id_book_item_id_fk" FOREIGN KEY ("book_id") REFERENCES "book"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_reading_program" ADD CONSTRAINT "book_reading_program_book_id_book_item_id_fk" FOREIGN KEY ("book_id") REFERENCES "book"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_reading_program" ADD CONSTRAINT "book_reading_program_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_reading_program" ADD CONSTRAINT "book_reading_program_book_id_library_id_catalog_item_id_library_id_fk" FOREIGN KEY ("book_id","library_id") REFERENCES "catalog_item"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_topic" ADD CONSTRAINT "book_topic_book_id_book_item_id_fk" FOREIGN KEY ("book_id") REFERENCES "book"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_topic" ADD CONSTRAINT "book_topic_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_topic" ADD CONSTRAINT "book_topic_book_id_library_id_catalog_item_id_library_id_fk" FOREIGN KEY ("book_id","library_id") REFERENCES "catalog_item"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book" ADD CONSTRAINT "book_item_id_catalog_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "catalog_item"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item_collection_assignment" ADD CONSTRAINT "catalog_item_collection_assignment_collection_id_catalog_item_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "catalog_item_collection"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item_collection_assignment" ADD CONSTRAINT "catalog_item_collection_assignment_item_id_catalog_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "catalog_item"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item_collection" ADD CONSTRAINT "catalog_item_collection_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item_collection" ADD CONSTRAINT "catalog_item_collection_policy_id_catalog_item_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "catalog_item_policy"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item_copy" ADD CONSTRAINT "catalog_item_copy_item_id_library_id_catalog_item_id_library_id_fk" FOREIGN KEY ("item_id","library_id") REFERENCES "catalog_item"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item_policy" ADD CONSTRAINT "catalog_item_policy_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item_query" ADD CONSTRAINT "catalog_item_query_library_id_organization_id_library_id_organization_id_fk" FOREIGN KEY ("library_id","organization_id") REFERENCES "library"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item_query" ADD CONSTRAINT "catalog_item_query_organization_id_owner_id_organization_user_organization_id_user_id_fk" FOREIGN KEY ("organization_id","owner_id") REFERENCES "organization_user"("organization_id","user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog_item" ADD CONSTRAINT "catalog_item_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkout_restriction" ADD CONSTRAINT "checkout_restriction_item_policy_id_library_id_catalog_item_policy_id_library_id_fk" FOREIGN KEY ("item_policy_id","library_id") REFERENCES "catalog_item_policy"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkout_restriction" ADD CONSTRAINT "checkout_restriction_patron_policy_id_library_id_library_patron_policy_id_library_id_fk" FOREIGN KEY ("patron_policy_id","library_id") REFERENCES "library_patron_policy"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkout" ADD CONSTRAINT "checkout_copy_id_library_id_catalog_item_copy_id_library_id_fk" FOREIGN KEY ("copy_id","library_id") REFERENCES "catalog_item_copy"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkout" ADD CONSTRAINT "checkout_library_id_organization_id_library_id_organization_id_fk" FOREIGN KEY ("library_id","organization_id") REFERENCES "library"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkout" ADD CONSTRAINT "checkout_organization_id_created_by_organization_user_organization_id_user_id_fk" FOREIGN KEY ("organization_id","created_by") REFERENCES "organization_user"("organization_id","user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkout" ADD CONSTRAINT "checkout_patron_id_organization_id_patron_id_organization_id_fk" FOREIGN KEY ("patron_id","organization_id") REFERENCES "patron"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hold" ADD CONSTRAINT "hold_copy_id_item_id_catalog_item_copy_id_item_id_fk" FOREIGN KEY ("copy_id","item_id") REFERENCES "catalog_item_copy"("id","item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hold" ADD CONSTRAINT "hold_item_id_library_id_catalog_item_id_library_id_fk" FOREIGN KEY ("item_id","library_id") REFERENCES "catalog_item"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hold" ADD CONSTRAINT "hold_library_id_organization_id_library_id_organization_id_fk" FOREIGN KEY ("library_id","organization_id") REFERENCES "library"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hold" ADD CONSTRAINT "hold_patron_id_organization_id_patron_id_organization_id_fk" FOREIGN KEY ("patron_id","organization_id") REFERENCES "patron"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "holiday" ADD CONSTRAINT "holiday_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "library" ADD CONSTRAINT "library_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "library_checkout_ceiling" ADD CONSTRAINT "library_checkout_ceiling_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "library_patron_policy" ADD CONSTRAINT "library_patron_policy_library_id_organization_id_library_id_organization_id_fk" FOREIGN KEY ("library_id","organization_id") REFERENCES "library"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marc_file_import" ADD CONSTRAINT "marc_file_import_library_id_organization_id_library_id_organization_id_fk" FOREIGN KEY ("library_id","organization_id") REFERENCES "library"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marc_file_import" ADD CONSTRAINT "marc_file_import_organization_id_user_id_organization_user_organization_id_user_id_fk" FOREIGN KEY ("organization_id","user_id") REFERENCES "organization_user"("organization_id","user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "one_roster_integration_config" ADD CONSTRAINT "one_roster_integration_config_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_invite" ADD CONSTRAINT "organization_invite_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_user" ADD CONSTRAINT "organization_user_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_user" ADD CONSTRAINT "organization_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_group_assignment" ADD CONSTRAINT "patron_group_assignment_organization_id_group_id_patron_group_organization_id_id_fk" FOREIGN KEY ("organization_id","group_id") REFERENCES "patron_group"("organization_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_group_assignment" ADD CONSTRAINT "patron_group_assignment_organization_id_patron_id_patron_organization_id_id_fk" FOREIGN KEY ("organization_id","patron_id") REFERENCES "patron"("organization_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_group_library_policy_assignment" ADD CONSTRAINT "patron_group_library_policy_assignment_group_id_organization_id_patron_group_id_organization_id_fk" FOREIGN KEY ("group_id","organization_id") REFERENCES "patron_group"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_group_library_policy_assignment" ADD CONSTRAINT "patron_group_library_policy_assignment_library_id_organization_id_library_id_organization_id_fk" FOREIGN KEY ("library_id","organization_id") REFERENCES "library"("id","organization_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_group_library_policy_assignment" ADD CONSTRAINT "patron_group_library_policy_assignment_library_id_policy_id_library_patron_policy_library_id_id_fk" FOREIGN KEY ("library_id","policy_id") REFERENCES "library_patron_policy"("library_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_group" ADD CONSTRAINT "patron_group_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_import" ADD CONSTRAINT "patron_import_organization_id_sync_id_patron_sync_organization_id_id_fk" FOREIGN KEY ("organization_id","sync_id") REFERENCES "patron_sync"("organization_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_query" ADD CONSTRAINT "patron_query_organization_id_owner_id_organization_user_organization_id_user_id_fk" FOREIGN KEY ("organization_id","owner_id") REFERENCES "organization_user"("organization_id","user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_sync" ADD CONSTRAINT "patron_sync_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron" ADD CONSTRAINT "patron_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
