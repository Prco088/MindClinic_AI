"use server";

import { auth } from "@/auth";
import { DiagnosisFormValues } from "@/lib/validations/diagnosis";
import { 
  createDiagnosis as createService,
  updateDiagnosis as updateService,
  getDiagnosesByPatient as getDiagnosesService
} from "@/services/clinical/diagnosis.service";

async function getSessionTenantId() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("Não autorizado. Usuário não pertence a nenhum tenant.");
  }
  return session.user.tenantId;
}

async function getSessionUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado. Usuário não encontrado.");
  }
  return session.user.id;
}

export async function createDiagnosis(patientId: string, data: DiagnosisFormValues) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Não autorizado. Tenant não encontrado.");

  const userId = await getSessionUserId();
  
  return await createService(tenantId, patientId, userId, data);
}

export async function updateDiagnosis(diagnosisId: string, data: DiagnosisFormValues) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Não autorizado. Tenant não encontrado.");

  const userId = await getSessionUserId();

  return await updateService(tenantId, diagnosisId, userId, data);
}

export async function getDiagnosesByPatient(patientId: string) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Não autorizado. Tenant não encontrado.");

  return await getDiagnosesService(tenantId, patientId);
}
