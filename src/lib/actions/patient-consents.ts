"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getPatientSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.type !== "PATIENT") {
    throw new Error("Não autorizado");
  }
  return { tenantId: session.user.tenantId, patientId: session.user.id };
}

export async function acceptPatientConsentAction(consentVersionId: string) {
  const { tenantId, patientId } = await getPatientSession();
  
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  const consentVersion = await prisma.consentVersion.findFirst({
    where: {
      id: consentVersionId,
      tenantId,
      isActive: true,
    }
  });

  if (!consentVersion) {
    throw new Error("Consentimento não encontrado ou inativo.");
  }

  const acceptance = await prisma.consentAcceptance.create({
    data: {
      tenantId,
      patientId,
      consentVersionId,
      acceptedIp: ip,
      acceptedUserAgent: userAgent,
      acceptedBy: "PATIENT",
    }
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      patientId,
      entity: "ConsentAcceptance",
      entityId: acceptance.id,
      action: "PATIENT_CONSENT_ACCEPT",
    }
  });

  revalidatePath("/patient/consents");
  revalidatePath("/patient/timeline");
}

export async function revokePatientConsentAction(acceptanceId: string) {
  const { tenantId, patientId } = await getPatientSession();

  const acceptance = await prisma.consentAcceptance.findFirst({
    where: {
      id: acceptanceId,
      tenantId,
      patientId,
      revokedAt: null,
    }
  });

  if (!acceptance) {
    throw new Error("Consentimento não encontrado ou já revogado.");
  }

  await prisma.consentAcceptance.update({
    where: { id: acceptanceId },
    data: {
      revokedAt: new Date(),
      revokedBy: "PATIENT",
    }
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      patientId,
      entity: "ConsentAcceptance",
      entityId: acceptance.id,
      action: "PATIENT_CONSENT_REVOKE",
    }
  });

  revalidatePath("/patient/consents");
  revalidatePath("/patient/timeline");
}
