"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { consentService } from "@/services/clinical/consent.service";
import { ConsentCategory } from "@prisma/client";

async function getSessionTenantId() {
  const session = await auth();
  return session?.user?.tenantId;
}

async function getSessionUser() {
  const session = await auth();
  return session?.user;
}

const createConsentVersionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  version: z.string().min(1),
  category: z.nativeEnum(ConsentCategory),
});

const acceptConsentSchema = z.object({
  patientId: z.string().min(1),
  consentVersionId: z.string().min(1),
});

const revokeConsentSchema = z.object({
  patientId: z.string().min(1),
  consentAcceptanceId: z.string().min(1),
});

export async function createConsentVersionAction(data: z.infer<typeof createConsentVersionSchema>) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) {
    throw new Error("Não autorizado");
  }

  const parsed = createConsentVersionSchema.parse(data);

  await consentService.createConsentVersion({
    tenantId,
    title: parsed.title,
    description: parsed.description,
    version: parsed.version,
    category: parsed.category,
  });
}

export async function acceptConsentAction(data: z.infer<typeof acceptConsentSchema>) {
  const tenantId = await getSessionTenantId();
  const user = await getSessionUser();
  if (!tenantId || !user || !user.id) {
    throw new Error("Não autorizado");
  }

  const parsed = acceptConsentSchema.parse(data);

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const acceptedIp = forwardedFor ? forwardedFor.split(",")[0] : undefined;
  const acceptedUserAgent = headersList.get("user-agent") || undefined;

  await consentService.acceptConsent({
    tenantId,
    patientId: parsed.patientId,
    consentVersionId: parsed.consentVersionId,
    acceptedIp,
    acceptedUserAgent,
    acceptedBy: user.id as string,
  });

  revalidatePath(`/patients/${parsed.patientId}/consents`);
  revalidatePath(`/patients/${parsed.patientId}/timeline`);
}

export async function revokeConsentAction(data: z.infer<typeof revokeConsentSchema>) {
  const tenantId = await getSessionTenantId();
  const user = await getSessionUser();
  if (!tenantId || !user || !user.id) {
    throw new Error("Não autorizado");
  }

  const parsed = revokeConsentSchema.parse(data);

  await consentService.revokeConsent({
    tenantId,
    consentAcceptanceId: parsed.consentAcceptanceId,
    revokedBy: user.id as string,
  });

  revalidatePath(`/patients/${parsed.patientId}/consents`);
  revalidatePath(`/patients/${parsed.patientId}/timeline`);
}

export async function getPatientConsentsAction(patientId: string) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) {
    throw new Error("Não autorizado");
  }

  return consentService.getPatientConsents(tenantId, patientId);
}

export async function getConsentHistoryAction(patientId: string) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) {
    throw new Error("Não autorizado");
  }

  return consentService.getConsentHistory(tenantId, patientId);
}
