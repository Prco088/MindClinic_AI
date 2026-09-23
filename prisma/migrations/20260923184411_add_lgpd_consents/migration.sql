-- CreateEnum
CREATE TYPE "ConsentCategory" AS ENUM ('DATA_PROCESSING', 'DOCUMENT_STORAGE', 'TELEMEDICINE', 'AI_ASSISTANCE', 'MARKETING');

-- CreateTable
CREATE TABLE "ConsentVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "category" "ConsentCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentAcceptance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "consentVersionId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedIp" TEXT,
    "acceptedUserAgent" TEXT,
    "acceptedBy" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentAcceptance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConsentVersion" ADD CONSTRAINT "ConsentVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentAcceptance" ADD CONSTRAINT "ConsentAcceptance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentAcceptance" ADD CONSTRAINT "ConsentAcceptance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentAcceptance" ADD CONSTRAINT "ConsentAcceptance_consentVersionId_fkey" FOREIGN KEY ("consentVersionId") REFERENCES "ConsentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
