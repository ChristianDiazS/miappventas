-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "image" TEXT,
ADD COLUMN     "selectedSize" TEXT,
ADD COLUMN     "sizes" JSONB;
