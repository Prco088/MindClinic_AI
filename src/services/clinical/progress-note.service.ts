import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProgressNoteFormValues, ProgressNoteAddendumFormValues } from "@/lib/validations/progress-note";

export async function createProgressNote(
  tenantId: string,
  patientId: string,
  userId: string,
  data: ProgressNoteFormValues
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const note = await tx.progressNote.create({
      data: {
        tenantId,
        patientId,
        userId,
        sessionDate: data.sessionDate,
        content: data.content,
        clinicalAssessment: data.clinicalAssessment,
        therapeuticPlan: data.therapeuticPlan,
        observations: data.observations,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        entity: "ProgressNote",
        entityId: note.id,
        action: "CREATE",
        newData: JSON.parse(JSON.stringify(note)),
      },
    });

    return note;
  });
}

export async function updateProgressNote(
  tenantId: string,
  noteId: string,
  userId: string,
  data: ProgressNoteFormValues
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.progressNote.findUnique({
      where: { id: noteId, tenantId },
    });

    if (!existing) throw new Error("Progress note not found.");
    if (existing.isSigned) throw new Error("Cannot edit a signed progress note.");

    const updated = await tx.progressNote.update({
      where: { id: noteId },
      data: {
        sessionDate: data.sessionDate,
        content: data.content,
        clinicalAssessment: data.clinicalAssessment,
        therapeuticPlan: data.therapeuticPlan,
        observations: data.observations,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        entity: "ProgressNote",
        entityId: noteId,
        action: "UPDATE",
        oldData: JSON.parse(JSON.stringify(existing)),
        newData: JSON.parse(JSON.stringify(updated)),
      },
    });

    return updated;
  });
}

export async function signProgressNote(
  tenantId: string,
  noteId: string,
  userId: string
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.progressNote.findUnique({
      where: { id: noteId, tenantId },
    });

    if (!existing) throw new Error("Progress note not found.");
    if (existing.isSigned) throw new Error("Progress note is already signed.");

    const signed = await tx.progressNote.update({
      where: { id: noteId },
      data: {
        isSigned: true,
        signedAt: new Date(),
        signedBy: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        entity: "ProgressNote",
        entityId: noteId,
        action: "SIGN",
        oldData: JSON.parse(JSON.stringify(existing)),
        newData: JSON.parse(JSON.stringify(signed)),
      },
    });

    return signed;
  });
}

export async function createProgressNoteAddendum(
  tenantId: string,
  noteId: string,
  userId: string,
  data: ProgressNoteAddendumFormValues
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.progressNote.findUnique({
      where: { id: noteId, tenantId },
    });

    if (!existing) throw new Error("Progress note not found.");
    if (!existing.isSigned) throw new Error("Cannot add an addendum to an unsigned note.");

    const addendum = await tx.progressNoteAddendum.create({
      data: {
        tenantId,
        progressNoteId: noteId,
        userId,
        content: data.content,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        entity: "ProgressNoteAddendum",
        entityId: addendum.id,
        action: "ADDENDUM",
        newData: JSON.parse(JSON.stringify(addendum)),
      },
    });

    return addendum;
  });
}

export async function getProgressNotesByPatient(tenantId: string, patientId: string) {
  return await prisma.progressNote.findMany({
    where: { tenantId, patientId, deletedAt: null },
    include: {
      addendums: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { name: true },
          },
        },
      },
      user: {
        select: { name: true },
      },
    },
    orderBy: { sessionDate: 'desc' },
  });
}
