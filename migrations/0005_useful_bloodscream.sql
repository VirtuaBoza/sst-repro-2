DROP INDEX IF EXISTS "book_author_name_library_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "book_reading_program_name_library_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "book_topic_name_library_id_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_author_name_library_id_index" ON "book_author" ("name","library_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_reading_program_name_library_id_index" ON "book_reading_program" ("name","library_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_topic_name_library_id_index" ON "book_topic" ("name","library_id");