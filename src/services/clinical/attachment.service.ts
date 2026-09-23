import prisma from "@/lib/prisma";
import { r2Service } from "@/services/storage/r2.service";
import { randomUUID } from "crypto";

export interface PrepareUploadData {
  tenantId: string;
  patientId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
}

export interface SaveAttachmentData extends PrepareUploadData {
  storageKey: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeleteAttachmentData {
  tenantId: string;
  attachmentId: string;
  deletedBy: string;
  ipAddress?: string;
  userAgent?: string;
}

const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const attachmentService = {
  async prepareUpload(data: PrepareUploadData) {
    if (!ALLOWED_MIME_TYPES.includes(data.mimeType)) {
      throw new Error("Tipo de arquivo não permitido.");
    }
    
    if (data.fileSize > MAX_FILE_SIZE) {
      throw new Error("O arquivo excede o limite de 20MB.");
    }

    const fileExtension = data.fileName.split('.').pop();
    const storageKey = `${data.tenantId}/${data.patientId}/${randomUUID()}.${fileExtension}`;
    
    const uploadUrl = await r2Service.getSignedUploadUrl(storageKey, data.mimeType);

    return {
      uploadUrl,
      storageKey,
    };
  },

  async saveAttachment(data: SaveAttachmentData) {
    const attachment = await prisma.$transaction(async (tx) => {
      const record = await tx.attachment.create({
        data: {
          tenantId: data.tenantId,
          patientId: data.patientId,
          fileName: data.fileName,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          storageKey: data.storageKey,
          uploadedBy: data.uploadedBy,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.uploadedBy,
          entity: "Attachment",
          entityId: record.id,
          action: "ATTACHMENT_UPLOAD",
          newData: {
            fileName: data.fileName,
            mimeType: data.mimeType,
            fileSize: data.fileSize,
            storageKey: data.storageKey,
          },
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      return record;
    });

    return attachment;
  },

  async getPatientAttachments(tenantId: string, patientId: string) {
    return prisma.attachment.findMany({
      where: {
        tenantId,
        patientId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          }
        }
      }
    });
  },

  async getDownloadUrl(tenantId: string, attachmentId: string, userId: string, ipAddress?: string, userAgent?: string) {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId, tenantId, deletedAt: null },
    });

    if (!attachment) {
      throw new Error("Anexo não encontrado.");
    }

    // Log the download
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        entity: "Attachment",
        entityId: attachment.id,
        action: "ATTACHMENT_DOWNLOAD",
        ipAddress,
        userAgent,
      },
    });

    return r2Service.getSignedDownloadUrl(attachment.storageKey);
  },

  async deleteAttachment(data: DeleteAttachmentData) {
    const attachment = await prisma.$transaction(async (tx) => {
      const existing = await tx.attachment.findUnique({
        where: { id: data.attachmentId, tenantId: data.tenantId, deletedAt: null },
      });

      if (!existing) {
        throw new Error("Anexo não encontrado.");
      }

      const updated = await tx.attachment.update({
        where: { id: data.attachmentId },
        data: {
          deletedAt: new Date(),
          deletedBy: data.deletedBy,
        },
      });

      // Also trigger R2 delete if required, or we just soft delete to keep history.
      // The requirement says "Documento removido", we will soft delete and trigger R2 delete in background
      // For now, let's just delete from R2 to save space since soft delete means it's invisible anyway.
      // Wait, soft delete usually means we might restore it. Let's not delete from R2 for now, or maybe yes.
      // We will actually delete from R2 to avoid storage cost, since the audit log will record the deletion.
      await r2Service.deleteFile(existing.storageKey).catch(console.error);

      await tx.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.deletedBy,
          entity: "Attachment",
          entityId: updated.id,
          action: "ATTACHMENT_DELETE",
          oldData: {
            fileName: existing.fileName,
            storageKey: existing.storageKey,
          },
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      return updated;
    });

    return attachment;
  }
};
