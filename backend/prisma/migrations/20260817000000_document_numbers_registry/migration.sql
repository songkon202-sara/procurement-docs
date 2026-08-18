-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "doc_no_prefix" TEXT;

-- DropIndex
DROP INDEX "document_numbers_case_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "document_numbers_case_id_doc_id_key" ON "document_numbers"("case_id", "doc_id");
