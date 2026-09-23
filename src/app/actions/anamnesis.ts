"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { AnamnesisService } from "@/services/clinical/anamnesis.service";
import { anamnesisSchema, AnamnesisFormValues } from "@/lib/validations/anamnesis";

async function getSessionInfo() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) {
    throw new Error("Não autorizado.");
  }
  
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
    ipAddress,
    userAgent
  };
}

export async function createAnamnesis(patientId: string, data: AnamnesisFormValues) {
  const { tenantId, userId, ipAddress, userAgent } = await getSessionInfo();
  const parsedData = anamnesisSchema.parse(data);

  const result = await AnamnesisService.create(
    tenantId,
    patientId,
    userId,
    parsedData,
    ipAddress,
    userAgent
  );

  revalidatePath(`/patients/${patientId}/record/anamnesis`);
  revalidatePath(`/patients/${patientId}/record`);
  return result;
}

export async function updateAnamnesis(id: string, patientId: string, data: AnamnesisFormValues) {
  const { tenantId, userId, ipAddress, userAgent } = await getSessionInfo();
  const parsedData = anamnesisSchema.parse(data);

  const result = await AnamnesisService.update(
    id,
    tenantId,
    userId,
    parsedData,
    ipAddress,
    userAgent
  );

  revalidatePath(`/patients/${patientId}/record/anamnesis`);
  revalidatePath(`/patients/${patientId}/record`);
  return result;
}

export async function getAnamnesisByPatient(patientId: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return null;
  return AnamnesisService.getByPatient(session.user.tenantId, patientId);
}

export async function deleteAnamnesis(id: string, patientId: string) {
  const { tenantId, userId, ipAddress, userAgent } = await getSessionInfo();

  await AnamnesisService.softDelete(id, tenantId, userId, ipAddress, userAgent);
  
  revalidatePath(`/patients/${patientId}/record/anamnesis`);
  revalidatePath(`/patients/${patientId}/record`);
}
