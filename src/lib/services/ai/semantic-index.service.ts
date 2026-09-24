import { EmbeddingSourceType, AiProvider } from "@prisma/client";
import prisma from "@/lib/prisma";
import { AiProviderFactory } from "../../ai/factory";
import { hasActiveAiConsent } from "./lgpd-helper";

export async function createEmbedding(
  tenantId: string,
  patientId: string,
  sourceType: EmbeddingSourceType,
  sourceId: string,
  content: string,
  userId: string
) {
  // 1. Verificação LGPD
  const hasConsent = await hasActiveAiConsent(tenantId, patientId);
  if (!hasConsent) {
    throw new Error("O paciente não possui consentimento ativo para uso de Inteligência Artificial (LGPD).");
  }

  // 2. Gerar Embedding (usando o mock provider por enquanto)
  const aiProvider = AiProviderFactory.getProvider(AiProvider.OPENAI); // MOCK
  const embedding = await aiProvider.generateEmbedding(content);
  const vectorStr = `[${embedding.join(",")}]`;

  // 3. Inserir no banco via executeRaw para suportar o tipo vector
  await prisma.$executeRaw`
    INSERT INTO "AiEmbedding" ("id", "tenantId", "patientId", "sourceType", "sourceId", "content", "embedding", "createdAt")
    VALUES (gen_random_uuid(), ${tenantId}, ${patientId}, ${sourceType}::"EmbeddingSourceType", ${sourceId}, ${content}, ${vectorStr}::vector, NOW())
  `;

  // 4. Registrar no AuditLog
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      patientId,
      action: "AI_INDEX_CREATED",
      entity: "AiEmbedding",
      entityId: sourceId,
      newData: { sourceType, contentPreview: content.substring(0, 50) }
    }
  });

  return true;
}

export async function indexAnamnesis(tenantId: string, patientId: string, anamnesisId: string, content: string, userId: string) {
  return createEmbedding(tenantId, patientId, EmbeddingSourceType.ANAMNESIS, anamnesisId, content, userId);
}

export async function indexProgressNote(tenantId: string, patientId: string, progressNoteId: string, content: string, userId: string) {
  return createEmbedding(tenantId, patientId, EmbeddingSourceType.PROGRESS_NOTE, progressNoteId, content, userId);
}

export async function indexDiagnosis(tenantId: string, patientId: string, diagnosisId: string, content: string, userId: string) {
  return createEmbedding(tenantId, patientId, EmbeddingSourceType.DIAGNOSIS, diagnosisId, content, userId);
}

export async function indexDocument(tenantId: string, patientId: string, documentId: string, content: string, userId: string) {
  return createEmbedding(tenantId, patientId, EmbeddingSourceType.ATTACHMENT, documentId, content, userId);
}
