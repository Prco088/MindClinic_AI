import prisma from "@/lib/prisma";
import { ConsentCategory } from "@prisma/client";

export async function hasActiveAiConsent(tenantId: string, patientId: string): Promise<boolean> {
  const activeConsent = await prisma.consentAcceptance.findFirst({
    where: {
      tenantId,
      patientId,
      revokedAt: null,
      consentVersion: {
        category: ConsentCategory.AI_ASSISTANCE,
        isActive: true,
      },
    },
  });

  return !!activeConsent;
}
