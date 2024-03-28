CREATE TABLE IF NOT EXISTS "embedding" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"input" text NOT NULL,
	"model" text NOT NULL,
	"value" vector(1536) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "embedding_id" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embedding_input_index" ON "embedding" ("input");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book" ADD CONSTRAINT "book_embedding_id_embedding_id_fk" FOREIGN KEY ("embedding_id") REFERENCES "embedding"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN IF EXISTS "embedding";