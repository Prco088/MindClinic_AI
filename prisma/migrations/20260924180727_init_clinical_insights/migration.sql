-- CreateEnum
CREATE TYPE "ClinicalInsightType" AS ENUM ('LONGITUDINAL_SUMMARY', 'RECURRING_THEMES', 'ENGAGEMENT_PATTERN', 'FOLLOWUP_ALERT', 'DOCUMENT_PATTERN', 'CONSENT_ALERT', 'SCHEDULING_PATTERN');

-- CreateTable
CREATE TABLE "ClinicalInsight" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "analysisId" TEXT,
    "type" "ClinicalInsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalInsight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClinicalInsight" ADD CONSTRAINT "ClinicalInsight_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalInsight" ADD CONSTRAINT "ClinicalInsight_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalInsight" ADD CONSTRAINT "ClinicalInsight_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "AiAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
