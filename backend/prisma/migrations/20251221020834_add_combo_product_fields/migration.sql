-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "comboItems" JSONB,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'individual';
