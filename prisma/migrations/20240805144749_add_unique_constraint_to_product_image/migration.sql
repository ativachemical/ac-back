/*
  Warnings:

  - You are about to drop the `ProductInTableKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductInTableSegmentValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductInTableValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductSegmentKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductSpecification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductInTableSegmentValue" DROP CONSTRAINT "ProductInTableSegmentValue_product_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductInTableSegmentValue" DROP CONSTRAINT "ProductInTableSegmentValue_product_in_table_key_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductInTableSegmentValue" DROP CONSTRAINT "ProductInTableSegmentValue_product_segment_key_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductInTableValue" DROP CONSTRAINT "ProductInTableValue_product_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductInTableValue" DROP CONSTRAINT "ProductInTableValue_product_in_table_key_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductSpecification" DROP CONSTRAINT "ProductSpecification_product_id_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "application" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "chemical_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "comercial_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "function" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "is_inactived" SET DEFAULT false;

-- DropTable
DROP TABLE "ProductInTableKey";

-- DropTable
DROP TABLE "ProductInTableSegmentValue";

-- DropTable
DROP TABLE "ProductInTableValue";

-- DropTable
DROP TABLE "ProductSegmentKey";

-- DropTable
DROP TABLE "ProductSpecification";

-- CreateTable
CREATE TABLE "ProductEnumKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProductEnumKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductValue" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_enum_key_id" INTEGER NOT NULL,
    "product_key_id" INTEGER NOT NULL,

    CONSTRAINT "ProductValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProductKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpecificationTable" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "name" TEXT DEFAULT '',
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "ProductSpecificationTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductEnumKey_key_key" ON "ProductEnumKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "unique_product_segment_per_product" ON "ProductValue"("product_id", "product_enum_key_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductKey_key_key" ON "ProductKey"("key");

-- AddForeignKey
ALTER TABLE "ProductValue" ADD CONSTRAINT "ProductValue_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductValue" ADD CONSTRAINT "ProductValue_product_key_id_fkey" FOREIGN KEY ("product_key_id") REFERENCES "ProductKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductValue" ADD CONSTRAINT "ProductValue_product_enum_key_id_fkey" FOREIGN KEY ("product_enum_key_id") REFERENCES "ProductEnumKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecificationTable" ADD CONSTRAINT "ProductSpecificationTable_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
