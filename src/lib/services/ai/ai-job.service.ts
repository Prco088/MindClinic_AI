import prisma from "@/lib/prisma";
import { AiJob, AiJobStatus, Prisma } from "@prisma/client";

export async function createAiJob(tenantId: string, analysisId: string, patientId?: string): Promise<AiJob> {
  const job = await prisma.aiJob.create({
    data: {
      tenantId,
      analysisId,
      patientId,
      jobType: "AI_GENERATION",
      status: AiJobStatus.PENDING,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      patientId,
      entity: "AiJob",
      entityId: job.id,
      action: "AI_JOB_CREATED",
    },
  });

  return job;
}

export async function updateAiJobStatus(
  id: string,
  tenantId: string,
  status: AiJobStatus,
  error?: string
) {
  const updateData: Prisma.AiJobUpdateInput = { status };
  
  if (status === AiJobStatus.RUNNING) {
    updateData.startedAt = new Date();
  } else if (status === AiJobStatus.COMPLETED || status === AiJobStatus.FAILED) {
    updateData.completedAt = new Date();
  }

  if (error) {
    updateData.error = error;
  }

  const updated = await prisma.aiJob.update({
    where: { id, tenantId },
    data: updateData,
  });

  if (status === AiJobStatus.COMPLETED || status === AiJobStatus.FAILED) {
    await prisma.auditLog.create({
      data: {
        tenantId,
        entity: "AiJob",
        entityId: id,
        action: status === AiJobStatus.COMPLETED ? "AI_JOB_COMPLETED" : "AI_JOB_FAILED",
      },
    });
  }

  return updated;
}
