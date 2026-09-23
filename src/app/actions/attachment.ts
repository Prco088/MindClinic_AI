"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { AttachmentService } from "@/services/storage/attachment.service";

async function getSessionData() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return { tenantId: session.user.tenantId, userId: session.user.id };
}

export async function uploadAttachmentAction(formData: FormData) {
  const { tenantId, userId } = await getSessionData();
  
  const patientId = formData.get("patientId") as string;
  const file = formData.get("file") as File;

  if (!patientId || !file) {
    throw new Error("Dados inválidos. patientId e file são obrigatórios.");
  }

  await AttachmentService.uploadAttachment({
    tenantId,
    patientId,
    uploadedBy: userId,
    file,
  });

  revalidatePath(`/patients/${patientId}/timeline`);
}

export async function createAttachmentVersionAction(formData: FormData) {
  const { tenantId, userId } = await getSessionData();
  
  const patientId = formData.get("patientId") as string;
  const attachmentId = formData.get("attachmentId") as string;
  const file = formData.get("file") as File;

  if (!attachmentId || !file || !patientId) {
    throw new Error("Dados inválidos.");
  }

  await AttachmentService.createVersion({
    tenantId,
    attachmentId,
    uploadedBy: userId,
    file,
  });

  revalidatePath(`/patients/${patientId}/timeline`);
}

export async function restoreAttachmentVersionAction(patientId: string, attachmentId: string, versionId: string) {
  const { tenantId, userId } = await getSessionData();

  await AttachmentService.restoreVersion({
    tenantId,
    attachmentId,
    versionId,
    userId,
  });

  revalidatePath(`/patients/${patientId}/timeline`);
}

export async function getAttachmentDownloadUrlAction(attachmentId: string) {
  const { tenantId, userId } = await getSessionData();
  return AttachmentService.downloadAttachment({
    tenantId,
    attachmentId,
    userId,
  });
}

export async function getAttachmentPreviewUrlAction(attachmentId: string) {
  const { tenantId, userId } = await getSessionData();
  return AttachmentService.previewAttachment({
    tenantId,
    attachmentId,
    userId,
  });
}

export async function deleteAttachmentAction(patientId: string, attachmentId: string) {
  const { tenantId, userId } = await getSessionData();
  
  await AttachmentService.deleteAttachment({
    tenantId,
    attachmentId,
    userId,
  });

  revalidatePath(`/patients/${patientId}/timeline`);
}
