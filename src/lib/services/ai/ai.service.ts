import { AiAnalysisType, AiProvider, AiJobStatus } from "@prisma/client";
import { hasActiveAiConsent } from "./lgpd-helper";
import { createAiAnalysis, updateAiAnalysisResult } from "./ai-analysis.service";
import { createAiJob, updateAiJobStatus } from "./ai-job.service";
import { AiProviderFactory } from "../../ai/factory";

export async function requestAiAnalysis(
  tenantId: string,
  createdBy: string,
  patientId: string,
  type: AiAnalysisType,
  title: string,
  provider: AiProvider,
  systemPrompt: string,
  userPrompt: string
) {
  // 1. Verificação LGPD
  const hasConsent = await hasActiveAiConsent(tenantId, patientId);
  if (!hasConsent) {
    throw new Error("O paciente não possui consentimento ativo para uso de Inteligência Artificial (LGPD).");
  }

  // 2. Criação da Análise (Registro inicial)
  const analysis = await createAiAnalysis({
    tenantId,
    patientId,
    createdBy,
    type,
    title,
    provider,
    systemPrompt,
    userPrompt,
  });

  // 3. Criação do Job Assíncrono (Fila simulada)
  const job = await createAiJob(tenantId, analysis.id, patientId);

  // 4. Execução (Na fase 8.1, isso é apenas arquitetural e mockado)
  // Em uma versão de produção real, o job seria enfileirado num background worker.
  // Aqui, nós rodamos de forma síncrona mockada, mas atualizamos o status como se fosse um fluxo assíncrono.
  
  await updateAiJobStatus(job.id, tenantId, AiJobStatus.RUNNING);

  try {
    const aiProvider = AiProviderFactory.getProvider(provider);
    const result = await aiProvider.generateText({
      systemPrompt,
      userPrompt,
    });

    await updateAiAnalysisResult(
      analysis.id,
      tenantId,
      result.text,
      result.inputTokens,
      result.outputTokens,
      AiJobStatus.COMPLETED
    );

    await updateAiJobStatus(job.id, tenantId, AiJobStatus.COMPLETED);

    return { analysisId: analysis.id, jobId: job.id, success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    await updateAiAnalysisResult(
      analysis.id,
      tenantId,
      "",
      0,
      0,
      AiJobStatus.FAILED
    );
    await updateAiJobStatus(job.id, tenantId, AiJobStatus.FAILED, errorMessage);
    throw error;
  }
}
