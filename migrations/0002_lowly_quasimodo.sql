ALTER TABLE "checkout_restriction" DROP CONSTRAINT "checkout_restriction_item_policy_id_patron_policy_id_pk";--> statement-breakpoint
ALTER TABLE "catalog_item_copy" ADD COLUMN "availability" text DEFAULT 'AVAILABLE' NOT NULL;--> statement-breakpoint
ALTER TABLE "checkout_restriction" ADD COLUMN "id" text DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "checkout" ADD COLUMN "due_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "checkout" ADD COLUMN "extension_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "checkout" ADD COLUMN "returned_datetime" timestamp;--> statement-breakpoint
ALTER TABLE "marc_file_import" ADD COLUMN "created_copies_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "marc_file_import" ADD COLUMN "created_titles_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "marc_file_import" ADD COLUMN "records_count" integer DEFAULT 0;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_restriction_item_policy_id_patron_policy_id_index" ON "checkout_restriction" ("item_policy_id","patron_policy_id");