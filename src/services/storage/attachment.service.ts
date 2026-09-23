import prisma from "@/lib/prisma";
import { r2Client } from "@/lib/r2";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export class AttachmentService {
  static validateFile(file: File) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error("Tipo de arquivo não permitido.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Arquivo excede o limite de 20MB.");
    }
  }

  static async uploadAttachment(params: {
    tenantId: string;
    patientId: string;
    uploadedBy: string;
    file: File;
  }) {
    const { tenantId, patientId, uploadedBy, file } = params;

    this.validateFile(file);

    const bytes = Buffer.from(await file.arrayBuffer());

    const storageKey = [
      "tenants",
      tenantId,
      "patients",
      patientId,
      "attachments",
      crypto.randomUUID(),
      file.name,
    ].join("/");

    await r2Client.uploadFile({
      key: storageKey,
      body: bytes,
      contentType: file.type,
    });

    const attachment = await prisma.attachment.create({
      data: {
        tenantId,
        patientId,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storageKey,
        uploadedBy,
        uploadedAt: new Date(),
        scanStatus: "PENDING",
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: uploadedBy,
        entity: "Attachment",
        entityId: attachment.id,
        action: "ATTACHMENT_UPLOAD",
      },
    });

    return attachment;
  }

  static async createVersion(params: {
    attachmentId: string;
    tenantId: string;
    uploadedBy: string;
    file: File;
  }) {
    const { attachmentId, tenantId, uploadedBy, file } = params;

    this.validateFile(file);

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        tenantId,
      },
    });

    if (!attachment) {
      throw new Error("Attachment não encontrado.");
    }

    const versionCount =
      await prisma.attachmentVersion.count({
        where: {
          attachmentId,
        },
      });

    const versionNumber = versionCount + 1;

    const storageKey = [
      "tenants",
      tenantId,
      "attachments",
      attachmentId,
      `v${versionNumber}`,
      file.name,
    ].join("/");

    const bytes = Buffer.from(await file.arrayBuffer());

    await r2Client.uploadFile({
      key: storageKey,
      body: bytes,
      contentType: file.type,
    });

    const version =
      await prisma.attachmentVersion.create({
        data: {
          attachmentId,
          fileName: file.name,
          storageKey,
        },
      });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: uploadedBy,
        entity: "Attachment",
        entityId: attachmentId,
        action: "ATTACHMENT_VERSION_CREATED",
      },
    });

    return version;
  }

  static async getAttachmentVersions(
    attachmentId: string,
    tenantId: string
  ) {
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        tenantId,
      },
      include: {
        versions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!attachment) {
      throw new Error("Attachment não encontrado.");
    }

    return attachment.versions;
  }

  static async restoreVersion(params: {
    attachmentId: string;
    versionId: string;
    tenantId: string;
    userId: string;
  }) {
    const {
      attachmentId,
      versionId,
      tenantId,
      userId,
    } = params;

    const version =
      await prisma.attachmentVersion.findUnique({
        where: {
          id: versionId,
        },
      });

    if (!version) {
      throw new Error("Versão não encontrada.");
    }

    await prisma.attachment.update({
      where: {
        id: attachmentId,
      },
      data: {
        storageKey: version.storageKey,
        fileName: version.fileName,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        entity: "Attachment",
        entityId: attachmentId,
        action: "ATTACHMENT_VERSION_RESTORED",
      },
    });

    return true;
  }

  static async getSignedUrl(params: {
    attachmentId: string;
    tenantId: string;
  }) {
    const attachment =
      await prisma.attachment.findFirst({
        where: {
          id: params.attachmentId,
          tenantId: params.tenantId,
          deletedAt: null,
        },
      });

    if (!attachment) {
      throw new Error("Documento não encontrado.");
    }

    return r2Client.getSignedUrl(
      attachment.storageKey,
      900
    );
  }

  static async downloadAttachment(params: {
    attachmentId: string;
    tenantId: string;
    userId: string;
  }) {
    const attachment =
      await prisma.attachment.findFirst({
        where: {
          id: params.attachmentId,
          tenantId: params.tenantId,
          deletedAt: null,
        },
      });

    if (!attachment) {
      throw new Error("Documento não encontrado.");
    }

    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        entity: "Attachment",
        entityId: attachment.id,
        action: "ATTACHMENT_DOWNLOAD",
      },
    });

    return r2Client.getSignedUrl(
      attachment.storageKey,
      900
    );
  }

  static async previewAttachment(params: {
    attachmentId: string;
    tenantId: string;
    userId: string;
  }) {
    const attachment =
      await prisma.attachment.findFirst({
        where: {
          id: params.attachmentId,
          tenantId: params.tenantId,
          deletedAt: null,
        },
      });

    if (!attachment) {
      throw new Error("Documento não encontrado.");
    }

    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        entity: "Attachment",
        entityId: attachment.id,
        action: "ATTACHMENT_PREVIEW",
      },
    });

    return r2Client.getSignedUrl(
      attachment.storageKey,
      300
    );
  }

  static async deleteAttachment(params: {
    attachmentId: string;
    tenantId: string;
    userId: string;
  }) {
    const attachment =
      await prisma.attachment.findFirst({
        where: {
          id: params.attachmentId,
          tenantId: params.tenantId,
        },
      });

    if (!attachment) {
      throw new Error("Documento não encontrado.");
    }

    await prisma.attachment.update({
      where: {
        id: attachment.id,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: params.userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        entity: "Attachment",
        entityId: attachment.id,
        action: "ATTACHMENT_DELETE",
      },
    });

    return true;
  }
}
