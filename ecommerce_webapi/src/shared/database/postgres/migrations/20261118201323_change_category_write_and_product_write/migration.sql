/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `CategoryWrite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `ProductWrite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ProductWrite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `CategoryWrite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `ProductWrite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ProductWrite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CategoryWrite" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductWrite" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "sku" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CategoryWrite_slug_key" ON "CategoryWrite"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductWrite_sku_key" ON "ProductWrite"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductWrite_slug_key" ON "ProductWrite"("slug");
