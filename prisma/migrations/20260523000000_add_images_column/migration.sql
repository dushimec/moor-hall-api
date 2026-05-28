-- Add images column to MenuItem table
-- This column was added to the Prisma schema but was missing from the database
ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "images" JSONB;
