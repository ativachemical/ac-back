-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "product_title" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "source_image" BYTEA NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImageCompacted" (
    "id" SERIAL NOT NULL,
    "source_image" BYTEA NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "ProductImageCompacted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSegmentKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProductSegmentKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInTableSegmentValue" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_segment_key_id" INTEGER NOT NULL,
    "product_in_table_key_id" INTEGER NOT NULL,

    CONSTRAINT "ProductInTableSegmentValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInTableKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProductInTableKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInTableValue" (
    "id" SERIAL NOT NULL,
    "product_in_table_key_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL DEFAULT '-',
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "ProductInTableValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTopicKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProductTopicKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTopicValue" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_topic_key_id" INTEGER NOT NULL,

    CONSTRAINT "ProductTopicValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpecification" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSegmentKey_key_key" ON "ProductSegmentKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "unique_product_segment_per_product" ON "ProductInTableSegmentValue"("product_id", "product_segment_key_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductInTableKey_key_key" ON "ProductInTableKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "unique_product_in_table_per_product" ON "ProductInTableValue"("product_id", "product_in_table_key_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTopicKey_key_key" ON "ProductTopicKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "unique_product_topic_per_product" ON "ProductTopicValue"("product_id", "product_topic_key_id");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImageCompacted" ADD CONSTRAINT "ProductImageCompacted_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInTableSegmentValue" ADD CONSTRAINT "ProductInTableSegmentValue_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInTableSegmentValue" ADD CONSTRAINT "ProductInTableSegmentValue_product_in_table_key_id_fkey" FOREIGN KEY ("product_in_table_key_id") REFERENCES "ProductInTableKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInTableSegmentValue" ADD CONSTRAINT "ProductInTableSegmentValue_product_segment_key_id_fkey" FOREIGN KEY ("product_segment_key_id") REFERENCES "ProductSegmentKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInTableValue" ADD CONSTRAINT "ProductInTableValue_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInTableValue" ADD CONSTRAINT "ProductInTableValue_product_in_table_key_id_fkey" FOREIGN KEY ("product_in_table_key_id") REFERENCES "ProductInTableKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTopicValue" ADD CONSTRAINT "ProductTopicValue_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTopicValue" ADD CONSTRAINT "ProductTopicValue_product_topic_key_id_fkey" FOREIGN KEY ("product_topic_key_id") REFERENCES "ProductTopicKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
