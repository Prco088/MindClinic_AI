import prisma from "@/lib/prisma";
import { AiAnalysisRequest } from "../../ai/types";
import { AiAnalysis, AiJobStatus, Prisma } from "@prisma/client";

export async function createAiAnalysis(data: AiAnalysisRequest): Promise<AiAnalysis> {
  const analysis = await prisma.aiAnalysis.create({
    data: {
      tenantId: data.tenantId,
      patientId: data.patientId,
      createdBy: data.createdBy,
      type: data.type,
      title: data.title,
      model: "mock-model",
      provider: data.provider,
      status: AiJobStatus.PENDING,
      metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: data.tenantId,
      userId: data.createdBy,
      patientId: data.patientId,
      entity: "AiAnalysis",
      entityId: analysis.id,
      action: "AI_ANALYSIS_CREATED",
    },
  });

  return analysis;
}

export async function updateAiAnalysisResult(
  id: string,
  tenantId: string,
  resultText: string,
  inputTokens: number,
  outputTokens: number,
  status: AiJobStatus
) {
  const updated = await prisma.aiAnalysis.update({
    where: { id, tenantId },
    data: {
      result: resultText,
      inputTokens,
      outputTokens,
      status,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      entity: "AiAnalysis",
      entityId: id,
      action: "AI_ANALYSIS_UPDATED",
    },
  });

  return updated;
}
