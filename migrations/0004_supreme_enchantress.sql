ALTER TABLE "marc_file_import" ADD COLUMN "no_barcode_behavior" text NOT NULL;--> statement-breakpoint
ALTER TABLE "marc_file_import" DROP COLUMN IF EXISTS "created_copies_count";--> statement-breakpoint
ALTER TABLE "marc_file_import" DROP COLUMN IF EXISTS "created_titles_count";--> statement-breakpoint
ALTER TABLE "marc_file_import" DROP COLUMN IF EXISTS "records_count";