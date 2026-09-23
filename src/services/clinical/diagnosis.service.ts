import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { DiagnosisFormValues } from "@/lib/validations/diagnosis";

export async function createDiagnosis(
  tenantId: string,
  patientId: string,
  userId: string,
  data: DiagnosisFormValues
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const diagnosis = await tx.diagnosis.create({
      data: {
        tenantId,
        patientId,
        userId,
        cidCode: data.cidCode,
        system: data.system,
        title: data.title,
        description: data.description,
        isActive: data.isActive,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        entity: "Diagnosis",
        entityId: diagnosis.id,
        action: "CREATE",
        newData: JSON.parse(JSON.stringify(diagnosis)),
      },
    });

    return diagnosis;
  });
}

export async function updateDiagnosis(
  tenantId: string,
  diagnosisId: string,
  userId: string,
  data: DiagnosisFormValues
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.diagnosis.findUnique({
      where: { id: diagnosisId, tenantId },
    });

    if (!existing) throw new Error("Diagnosis not found.");

    const updated = await tx.diagnosis.update({
      where: { id: diagnosisId },
      data: {
        cidCode: data.cidCode,
        system: data.system,
        title: data.title,
        description: data.description,
        isActive: data.isActive,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        entity: "Diagnosis",
        entityId: diagnosisId,
        action: "UPDATE",
        oldData: JSON.parse(JSON.stringify(existing)),
        newData: JSON.parse(JSON.stringify(updated)),
      },
    });

    return updated;
  });
}

export async function getDiagnosesByPatient(tenantId: string, patientId: string) {
  return await prisma.diagnosis.findMany({
    where: { tenantId, patientId, deletedAt: null },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
