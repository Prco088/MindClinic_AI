-- AlterTable
ALTER TABLE "Diagnosis" ADD COLUMN     "system" TEXT;

-- AlterTable
ALTER TABLE "ProgressNote" ADD COLUMN     "clinicalAssessment" TEXT,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "signedBy" TEXT,
ADD COLUMN     "therapeuticPlan" TEXT;

-- CreateTable
CREATE TABLE "ProgressNoteAddendum" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "progressNoteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressNoteAddendum_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgressNoteAddendum" ADD CONSTRAINT "ProgressNoteAddendum_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNoteAddendum" ADD CONSTRAINT "ProgressNoteAddendum_progressNoteId_fkey" FOREIGN KEY ("progressNoteId") REFERENCES "ProgressNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNoteAddendum" ADD CONSTRAINT "ProgressNoteAddendum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
