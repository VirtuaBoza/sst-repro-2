ALTER TABLE "catalog_item_copy" ALTER COLUMN "currency" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "catalog_item_query" ALTER COLUMN "catalog_item_query_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hold" ALTER COLUMN "hold_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "marc_file_import" ALTER COLUMN "duplicate_barcode_behavior" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "marc_file_import" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization_invite" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization_user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "patron_query" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "patron_sync" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "patron" ALTER COLUMN "gender" SET DATA TYPE text;