"use server";

import { auth } from "@/auth";
import { AiProvider } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  generateSessionSummary,
  generatePatientSummary,
  generateDocumentSummary,
} from "@/lib/services/ai/ai.service";
import { searchSemantic } from "@/lib/services/ai/semantic-search.service";
import { EmbeddingSourceType } from "@prisma/client";

export async function createSessionSummaryAction(patientId: string, progressNoteId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.tenantId) throw new Error("Não autorizado");

  const tenantId = session.user.tenantId;
  const createdBy = session.user.id;

  await generateSessionSummary(tenantId, createdBy, patientId, progressNoteId, AiProvider.GEMINI);

  revalidatePath("/ai/session-summary");
  revalidatePath("/ai");
}

export async function createPatientSummaryAction(patientId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.tenantId) throw new Error("Não autorizado");

  const tenantId = session.user.tenantId;
  const createdBy = session.user.id;

  await generatePatientSummary(tenantId, createdBy, patientId, AiProvider.GEMINI);

  revalidatePath("/ai/patient-summary");
  revalidatePath("/ai");
}

export async function createDocumentSummaryAction(patientId: string, attachmentId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.tenantId) throw new Error("Não autorizado");

  const tenantId = session.user.tenantId;
  const createdBy = session.user.id;

  await generateDocumentSummary(tenantId, createdBy, patientId, attachmentId, AiProvider.GEMINI);

  revalidatePath("/ai/document-summary");
  revalidatePath("/ai");
}

export async function executeSemanticSearchAction(query: string, limit: number = 5, sourceTypeFilter?: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.tenantId) throw new Error("Não autorizado");

  const tenantId = session.user.tenantId;
  const userId = session.user.id;
  const typeFilter = sourceTypeFilter ? (sourceTypeFilter as EmbeddingSourceType) : undefined;

  const results = await searchSemantic(tenantId, userId, query, limit, typeFilter);
  return results;
}
