import prisma from "@/lib/prisma";
import { ConsentCategory, Prisma, ConsentVersion, ConsentAcceptance } from "@prisma/client";

export interface CreateConsentVersionData {
  tenantId: string;
  title: string;
  description: string;
  version: string;
  category: ConsentCategory;
}

export interface AcceptConsentData {
  tenantId: string;
  patientId: string;
  consentVersionId: string;
  acceptedIp?: string;
  acceptedUserAgent?: string;
  acceptedBy?: string; // userId if signed by staff on behalf of patient, or patient's own ID if patient portal
}

export interface RevokeConsentData {
  tenantId: string;
  consentAcceptanceId: string;
  revokedBy: string; // userId who revoked it
}

export const consentService = {
  /**
   * Creates a new Consent Version.
   * Typically done by an admin or automatically via seed.
   */
  async createConsentVersion(data: CreateConsentVersionData) {
    // Optionally inactivate previous active versions of the same category
    await prisma.consentVersion.updateMany({
      where: {
        tenantId: data.tenantId,
        category: data.category,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return prisma.consentVersion.create({
      data: {
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        version: data.version,
        category: data.category,
        isActive: true,
      },
    });
  },

  /**
   * Records a patient's acceptance of a specific consent version.
   * Also generates an AuditLog entry.
   */
  async acceptConsent(data: AcceptConsentData) {
    const acceptance = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create the acceptance record
      const record = await tx.consentAcceptance.create({
        data: {
          tenantId: data.tenantId,
          patientId: data.patientId,
          consentVersionId: data.consentVersionId,
          acceptedIp: data.acceptedIp,
          acceptedUserAgent: data.acceptedUserAgent,
          acceptedBy: data.acceptedBy,
        },
      });

      // 2. Generate AuditLog if user context is provided
      if (data.acceptedBy) {
        await tx.auditLog.create({
          data: {
            tenantId: data.tenantId,
            userId: data.acceptedBy,
            entity: "ConsentAcceptance",
            entityId: record.id,
            action: "CONSENT_ACCEPT",
            newData: record as unknown as Prisma.InputJsonValue,
          },
        });
      }

      return record;
    });

    return acceptance;
  },

  /**
   * Revokes an existing consent acceptance.
   * Also generates an AuditLog entry.
   */
  async revokeConsent(data: RevokeConsentData) {
    const revoked = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const record = await tx.consentAcceptance.update({
        where: {
          id: data.consentAcceptanceId,
          tenantId: data.tenantId, // Ensure tenant isolation
        },
        data: {
          revokedAt: new Date(),
          revokedBy: data.revokedBy,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.revokedBy,
          entity: "ConsentAcceptance",
          entityId: record.id,
          action: "CONSENT_REVOKE",
          newData: record as unknown as Prisma.InputJsonValue,
        },
      });

      return record;
    });

    return revoked;
  },

  /**
   * Gets the current status of all ACTIVE consent categories for a patient.
   * Returns a list of active versions along with the patient's acceptance record (if any).
   */
  async getPatientConsents(tenantId: string, patientId: string) {
    // 1. Get all active versions for the tenant
    const activeVersions = await prisma.consentVersion.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Get the patient's latest acceptance for each active version
    const acceptances = await prisma.consentAcceptance.findMany({
      where: {
        tenantId,
        patientId,
        consentVersionId: {
          in: activeVersions.map((v: ConsentVersion) => v.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Map them together
    return activeVersions.map((version: ConsentVersion) => {
      // Find the most recent record for this version (could be revoked or accepted)
      const acceptanceRecord = acceptances.find((a: ConsentAcceptance) => a.consentVersionId === version.id);
      
      return {
        version,
        acceptance: acceptanceRecord || null,
        isAccepted: acceptanceRecord ? !acceptanceRecord.revokedAt : false,
      };
    });
  },

  /**
   * Gets the full history of acceptances and revocations for a patient.
   */
  async getConsentHistory(tenantId: string, patientId: string) {
    return prisma.consentAcceptance.findMany({
      where: {
        tenantId,
        patientId,
      },
      include: {
        consentVersion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
};
