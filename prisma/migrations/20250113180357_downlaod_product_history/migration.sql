/*
  Warnings:

  - Added the required column `product_id` to the `ProductDownloadHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_name` to the `ProductDownloadHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductDownloadHistory" ADD COLUMN     "product_id" INTEGER NOT NULL,
ADD COLUMN     "product_name" TEXT NOT NULL;
