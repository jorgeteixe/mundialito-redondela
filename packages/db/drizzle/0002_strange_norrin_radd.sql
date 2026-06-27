ALTER TABLE "match" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_code_unique" UNIQUE("code");