ALTER TABLE "book_edition_copy" DROP CONSTRAINT "book_edition_copy_import_record_id_marc_file_import_parsed_record_id_fk";
--> statement-breakpoint
ALTER TABLE "marc_file_import" DROP CONSTRAINT "marc_file_import_library_id_library_id_fk";
--> statement-breakpoint
ALTER TABLE "patron_sync" DROP CONSTRAINT "patron_sync_organization_id_organization_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_edition_copy" ADD CONSTRAINT "book_edition_copy_import_record_id_marc_file_import_parsed_record_id_fk" FOREIGN KEY ("import_record_id") REFERENCES "marc_file_import_parsed_record"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marc_file_import" ADD CONSTRAINT "marc_file_import_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patron_sync" ADD CONSTRAINT "patron_sync_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
