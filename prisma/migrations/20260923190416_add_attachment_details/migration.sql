/*
  Warnings:

  - You are about to drop the column `fileType` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `mimeType` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "fileType",
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "uploadedBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
