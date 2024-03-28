CREATE TABLE IF NOT EXISTS "marc_file_import_failed_record" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_id" text NOT NULL,
	"raw" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marc_file_import_parsed_record" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_id" text NOT NULL,
	"parsed" json NOT NULL,
	"raw" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_edition_copy" DROP CONSTRAINT "book_edition_copy_book_id_id_catalog_item_copy_item_id_id_fk";
--> statement-breakpoint
ALTER TABLE "book_edition_copy" DROP CONSTRAINT "book_edition_copy_book_id_edition_id_book_edition_book_id_id_fk";
--> statement-breakpoint
ALTER TABLE "book_edition" DROP CONSTRAINT "book_edition_book_id_book_item_id_fk";
--> statement-breakpoint
ALTER TABLE "book" DROP CONSTRAINT "book_item_id_catalog_item_id_fk";
--> statement-breakpoint
ALTER TABLE "hold" DROP CONSTRAINT "hold_copy_id_item_id_catalog_item_copy_id_item_id_fk";
--> statement-breakpoint
ALTER TABLE "marc_file_import" DROP CONSTRAINT "marc_file_import_library_id_organization_id_library_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "marc_file_import" DROP CONSTRAINT "marc_file_import_organization_id_user_id_organization_user_organization_id_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "book_edition_id_book_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "catalog_item_copy_id_item_id_index";--> statement-breakpoint
ALTER TABLE "catalog_item_copy" ALTER COLUMN "barcode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "book_edition_copy" ADD COLUMN "import_record_id" text;--> statement-breakpoint
ALTER TABLE "book_edition_copy" ADD COLUMN "library_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "book_edition" ADD COLUMN "library_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "library_id" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_edition_id_book_id_library_id_index" ON "book_edition" ("id","book_id","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_item_id_library_id_index" ON "book" ("item_id","library_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_item_copy_id_item_id_library_id_index" ON "catalog_item_copy" ("id","item_id","library_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition_copy" ADD CONSTRAINT "book_edition_copy_import_record_id_marc_file_import_parsed_record_id_fk" FOREIGN KEY ("import_record_id") REFERENCES "marc_file_import_parsed_record"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition_copy" ADD CONSTRAINT "book_edition_copy_book_id_id_library_id_catalog_item_copy_item_id_id_library_id_fk" FOREIGN KEY ("book_id","id","library_id") REFERENCES "catalog_item_copy"("item_id","id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition_copy" ADD CONSTRAINT "book_edition_copy_book_id_edition_id_library_id_book_edition_book_id_id_library_id_fk" FOREIGN KEY ("book_id","edition_id","library_id") REFERENCES "book_edition"("book_id","id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition" ADD CONSTRAINT "book_edition_book_id_library_id_book_item_id_library_id_fk" FOREIGN KEY ("book_id","library_id") REFERENCES "book"("item_id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book" ADD CONSTRAINT "book_item_id_library_id_catalog_item_id_library_id_fk" FOREIGN KEY ("item_id","library_id") REFERENCES "catalog_item"("id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hold" ADD CONSTRAINT "hold_copy_id_item_id_library_id_catalog_item_copy_id_item_id_library_id_fk" FOREIGN KEY ("copy_id","item_id","library_id") REFERENCES "catalog_item_copy"("id","item_id","library_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marc_file_import" ADD CONSTRAINT "marc_file_import_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "marc_file_import" DROP COLUMN IF EXISTS "organization_id";--> statement-breakpoint
ALTER TABLE "marc_file_import" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marc_file_import_failed_record" ADD CONSTRAINT "marc_file_import_failed_record_import_id_marc_file_import_id_fk" FOREIGN KEY ("import_id") REFERENCES "marc_file_import"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marc_file_import_parsed_record" ADD CONSTRAINT "marc_file_import_parsed_record_import_id_marc_file_import_id_fk" FOREIGN KEY ("import_id") REFERENCES "marc_file_import"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
