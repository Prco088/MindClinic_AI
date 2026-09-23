"use server";

import { auth } from "@/auth";
import { ProgressNoteFormValues, ProgressNoteAddendumFormValues } from "@/lib/validations/progress-note";
import { 
  createProgressNote as createService,
  updateProgressNote as updateService,
  signProgressNote as signService,
  createProgressNoteAddendum as addendumService,
  getProgressNotesByPatient as getNotesService
} from "@/services/clinical/progress-note.service";

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

export async function createProgressNote(patientId: string, data: ProgressNoteFormValues) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Não autorizado. Tenant não encontrado.");

  const userId = await getSessionUserId();
  if (!userId) throw new Error("Não autorizado. Usuário não encontrado.");

  return await createService(tenantId, patientId, userId, data);
}

export async function updateProgressNote(noteId: string, data: ProgressNoteFormValues) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Não autorizado. Tenant não encontrado.");

  const userId = await getSessionUserId();
  if (!userId) throw new Error("Não autorizado. Usuário não encontrado.");

  return await updateService(tenantId, noteId, userId, data);
}

export async function signProgressNote(noteId: string) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Não autorizado. Tenant não encontrado.");

  const userId = await getSessionUserId();
  if (!userId) throw new Error("Não autorizado. Usuário não encontrado.");

  return await signService(tenantId, noteId, userId);
}

export async function createProgressNoteAddendum(noteId: string, data: ProgressNoteAddendumFormValues) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Não autorizado. Tenant não encontrado.");

  const userId = await getSessionUserId();
  if (!userId) throw new Error("Não autorizado. Usuário não encontrado.");

  return await addendumService(tenantId, noteId, userId, data);
}

export async function getProgressNotesByPatient(patientId: string) {
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Não autorizado. Tenant não encontrado.");

  return await getNotesService(tenantId, patientId);
}
