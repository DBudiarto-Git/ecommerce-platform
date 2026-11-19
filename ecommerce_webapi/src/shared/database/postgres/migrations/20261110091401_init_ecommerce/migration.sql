/*
  Warnings:

  - You are about to drop the column `sku` on the `ProductWrite` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `ProductWrite` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProductWrite_sku_key";

-- AlterTable
ALTER TABLE "ProductWrite" DROP COLUMN "sku",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "stock" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "UserWrite" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserWrite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleWrite" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RoleWrite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryWrite" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryWrite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerWrite" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CustomerWrite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderWrite" (
    "id" SERIAL NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryAddress" TEXT,
    "customerId" INTEGER NOT NULL,

    CONSTRAINT "OrderWrite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemWrite" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "OrderItemWrite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWrite_email_key" ON "UserWrite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserWrite_resetToken_key" ON "UserWrite"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "RoleWrite_name_key" ON "RoleWrite"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryWrite_name_key" ON "CategoryWrite"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerWrite_userId_key" ON "CustomerWrite"("userId");

-- AddForeignKey
ALTER TABLE "UserWrite" ADD CONSTRAINT "UserWrite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "RoleWrite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWrite" ADD CONSTRAINT "ProductWrite_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryWrite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerWrite" ADD CONSTRAINT "CustomerWrite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserWrite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWrite" ADD CONSTRAINT "OrderWrite_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerWrite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemWrite" ADD CONSTRAINT "OrderItemWrite_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderWrite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemWrite" ADD CONSTRAINT "OrderItemWrite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductWrite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
