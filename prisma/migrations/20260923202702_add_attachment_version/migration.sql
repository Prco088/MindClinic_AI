-- CreateTable
CREATE TABLE "AttachmentVersion" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttachmentVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AttachmentVersion" ADD CONSTRAINT "AttachmentVersion_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
