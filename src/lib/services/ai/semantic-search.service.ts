import { EmbeddingSourceType, AiProvider } from "@prisma/client";
import prisma from "@/lib/prisma";
import { AiProviderFactory } from "../../ai/factory";

export interface SemanticSearchResult {
  id: string;
  sourceType: EmbeddingSourceType;
  sourceId: string;
  content: string;
  patientId: string;
  patientName: string;
  distance: number;
}

interface SemanticSearchResultRow {
  id: string;
  sourceType: EmbeddingSourceType;
  sourceId: string;
  content: string;
  patientId: string;
  patientName: string;
  distance: unknown;
}

export async function searchSemantic(
  tenantId: string,
  userId: string,
  query: string,
  limit: number = 5,
  sourceTypeFilter?: EmbeddingSourceType
): Promise<SemanticSearchResult[]> {
  // 1. Log search in audit log
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: "AI_SEARCH_EXECUTED",
      entity: "AiEmbedding",
      entityId: "Search",
      newData: { query, limit, sourceTypeFilter }
    }
  });

  // 2. Generate embedding for query
  const aiProvider = AiProviderFactory.getProvider(AiProvider.OPENAI); // MOCK
  const queryEmbedding = await aiProvider.generateEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  // 3. Execute vector search with cosine distance (<=>)
  // Distance is between 0 and 2. Lower is closer.
  let results: SemanticSearchResultRow[];

  if (sourceTypeFilter) {
    results = await prisma.$queryRaw`
      SELECT e.id, e."sourceType", e."sourceId", e.content, e."patientId", p."fullName" as "patientName",
             e.embedding <=> ${vectorStr}::vector as distance
      FROM "AiEmbedding" e
      JOIN "Patient" p ON e."patientId" = p.id
      WHERE e."tenantId" = ${tenantId} AND e."sourceType" = ${sourceTypeFilter}::"EmbeddingSourceType"
      ORDER BY distance ASC
      LIMIT ${limit}
    `;
  } else {
    results = await prisma.$queryRaw`
      SELECT e.id, e."sourceType", e."sourceId", e.content, e."patientId", p."fullName" as "patientName",
             e.embedding <=> ${vectorStr}::vector as distance
      FROM "AiEmbedding" e
      JOIN "Patient" p ON e."patientId" = p.id
      WHERE e."tenantId" = ${tenantId}
      ORDER BY distance ASC
      LIMIT ${limit}
    `;
  }

  return results.map((r) => ({
    id: r.id,
    sourceType: r.sourceType,
    sourceId: r.sourceId,
    content: r.content,
    patientId: r.patientId,
    patientName: r.patientName,
    distance: Number(r.distance)
  }));
}
