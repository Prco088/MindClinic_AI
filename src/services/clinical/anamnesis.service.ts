import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { AnamnesisFormValues } from "@/lib/validations/anamnesis";

export class AnamnesisService {
  static async create(
    tenantId: string,
    patientId: string,
    userId: string,
    formData: AnamnesisFormValues,
    ipAddress?: string,
    userAgent?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const anamnesis = await tx.anamnesis.create({
        data: {
          tenantId,
          patientId,
          formData: formData as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          entity: "Anamnesis",
          entityId: anamnesis.id,
          action: "CREATE",
          newData: formData as unknown as Prisma.InputJsonValue,
          ipAddress,
          userAgent,
        },
      });

      return anamnesis;
    });
  }

  static async update(
    id: string,
    tenantId: string,
    userId: string,
    formData: AnamnesisFormValues,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await prisma.anamnesis.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      throw new Error("Anamnese não encontrada ou acesso negado.");
    }

    return prisma.$transaction(async (tx) => {
      const anamnesis = await tx.anamnesis.update({
        where: { id },
        data: { formData: formData as unknown as Prisma.InputJsonValue },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          entity: "Anamnesis",
          entityId: anamnesis.id,
          action: "UPDATE",
          oldData: existing.formData as Prisma.InputJsonValue,
          newData: formData as unknown as Prisma.InputJsonValue,
          ipAddress,
          userAgent,
        },
      });

      return anamnesis;
    });
  }

  static async getByPatient(tenantId: string, patientId: string) {
    return prisma.anamnesis.findFirst({
      where: {
        tenantId,
        patientId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async softDelete(
    id: string,
    tenantId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await prisma.anamnesis.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      throw new Error("Anamnese não encontrada ou acesso negado.");
    }

    return prisma.$transaction(async (tx) => {
      const anamnesis = await tx.anamnesis.update({
        where: { id },
        data: { 
          deletedAt: new Date(),
          deletedBy: userId
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          entity: "Anamnesis",
          entityId: anamnesis.id,
          action: "DELETE",
          oldData: existing.formData as Prisma.InputJsonValue,
          ipAddress,
          userAgent,
        },
      });

      return anamnesis;
    });
  }
}
