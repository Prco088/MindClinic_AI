"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { r2Client } from "@/lib/r2";

async function getPatientSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.type !== "PATIENT") {
    throw new Error("Não autorizado");
  }
  return { tenantId: session.user.tenantId, patientId: session.user.id };
}

export async function getPatientDocumentPreviewUrlAction(attachmentId: string) {
  const { tenantId, patientId } = await getPatientSession();

  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      tenantId,
      patientId,
      deletedAt: null,
    },
  });

  if (!attachment) {
    throw new Error("Documento não encontrado ou sem permissão.");
  }

  await prisma.auditLog.create({
    data: {
      tenantId,
      patientId,
      entity: "Attachment",
      entityId: attachment.id,
      action: "PATIENT_DOCUMENT_VIEW",
    },
  });

  return r2Client.getSignedUrl(attachment.storageKey, 900);
}

export async function getPatientDocumentDownloadUrlAction(attachmentId: string) {
  const { tenantId, patientId } = await getPatientSession();

  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      tenantId,
      patientId,
      deletedAt: null,
    },
  });

  if (!attachment) {
    throw new Error("Documento não encontrado ou sem permissão.");
  }

  await prisma.auditLog.create({
    data: {
      tenantId,
      patientId,
      entity: "Attachment",
      entityId: attachment.id,
      action: "PATIENT_DOCUMENT_DOWNLOAD",
    },
  });

  return r2Client.getSignedUrl(attachment.storageKey, 900);
}
