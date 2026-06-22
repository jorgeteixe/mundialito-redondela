-- Add 'postiz' to social_provider. ALTER TYPE ... ADD VALUE cannot be used in
-- the same transaction it is created (Postgres 55P04), and drizzle-kit runs all
-- pending migrations in one transaction, so recreate the enum instead — this is
-- transaction-safe in a single migrate run.
ALTER TABLE "social_post_target" ALTER COLUMN "provider" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "social_post_target" ALTER COLUMN "provider" TYPE text;--> statement-breakpoint
DROP TYPE "public"."social_provider";--> statement-breakpoint
CREATE TYPE "public"."social_provider" AS ENUM('meta', 'postiz');--> statement-breakpoint
ALTER TABLE "social_post_target" ALTER COLUMN "provider" TYPE "public"."social_provider" USING "provider"::"public"."social_provider";--> statement-breakpoint
ALTER TABLE "social_post_target" ALTER COLUMN "provider" SET DEFAULT 'postiz';