import { AiAnalysisType, AiProvider, AiJobStatus } from "@prisma/client";
import { hasActiveAiConsent } from "./lgpd-helper";
import { createAiAnalysis, updateAiAnalysisResult } from "./ai-analysis.service";
import { createAiJob, updateAiJobStatus } from "./ai-job.service";
import { AiProviderFactory } from "../../ai/factory";
import prisma from "@/lib/prisma";
import { getOrCreateDefaultTemplate } from "./prompt-template.service";
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

// Phase 8.2 Additions

export async function generateSessionSummary(
  tenantId: string,
  createdBy: string,
  patientId: string,
  progressNoteId: string,
  provider: AiProvider
) {
  const note = await prisma.progressNote.findUnique({
    where: { id: progressNoteId, tenantId },
    include: { patient: true },
  });

  if (!note) throw new Error("Evolução clínica não encontrada.");

  const defaultPrompt = "Você é um assistente clínico. Sua tarefa é gerar um resumo ESTRITAMENTE FACTUAL da sessão. NÃO crie diagnósticos. NÃO sugira tratamentos. Apenas sumarize o que foi documentado.";
  const systemPrompt = await getOrCreateDefaultTemplate(tenantId, "SESSION_SUMMARY", defaultPrompt, "Template padrão para resumo de sessão clínica");

  const userPrompt = `
Paciente: ${note.patient.fullName}
Data da Sessão: ${note.createdAt.toISOString()}
Evolução:
${note.content}

Por favor, resuma a sessão.
  `;

  return requestAiAnalysis(
    tenantId,
    createdBy,
    patientId,
    "SESSION_SUMMARY",
    `Resumo da Sessão - ${note.createdAt.toLocaleDateString()}`,
    provider,
    systemPrompt,
    userPrompt
  );
}

export async function generatePatientSummary(
  tenantId: string,
  createdBy: string,
  patientId: string,
  provider: AiProvider
) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId, tenantId },
    include: {
      anamnesis: { orderBy: { createdAt: "desc" }, take: 1 },
      diagnoses: { where: { isActive: true } },
      progressNotes: { orderBy: { createdAt: "desc" }, take: 5 },
    }
  });

  if (!patient) throw new Error("Paciente não encontrado.");

  const defaultPrompt = "Você é um assistente clínico. Sua tarefa é gerar um resumo ESTRITAMENTE FACTUAL do histórico do paciente. NÃO crie diagnósticos. NÃO sugira tratamentos. Apenas consolide os dados fornecidos.";
  const systemPrompt = await getOrCreateDefaultTemplate(tenantId, "PATIENT_SUMMARY", defaultPrompt, "Template padrão para resumo de paciente");

  const anamnesisText = patient.anamnesis.length > 0 ? JSON.stringify(patient.anamnesis[0].formData) : "Sem anamnese registrada.";
  const diagnosesText = patient.diagnoses.map(d => `- ${d.cidCode || "S/N"}: ${d.title} - ${d.description || ""}`).join("\n");
  const notesText = patient.progressNotes.map(n => `Em ${n.createdAt.toLocaleDateString()}: ${n.content}`).join("\n\n");

  const userPrompt = `
Paciente: ${patient.fullName}

Anamnese Mais Recente:
${anamnesisText}

Diagnósticos Ativos:
${diagnosesText || "Nenhum ativo."}

Últimas Evoluções:
${notesText || "Nenhuma evolução."}

Por favor, gere uma visão consolidada do histórico do paciente com base ESTRITAMENTE nestes dados.
  `;

  return requestAiAnalysis(
    tenantId,
    createdBy,
    patientId,
    "PATIENT_SUMMARY",
    `Visão Consolidada - ${patient.fullName}`,
    provider,
    systemPrompt,
    userPrompt
  );
}

export async function generateDocumentSummary(
  tenantId: string,
  createdBy: string,
  patientId: string,
  attachmentId: string,
  provider: AiProvider
) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId, tenantId, patientId },
  });

  if (!attachment) throw new Error("Documento não encontrado.");

  // Para a Fase 8.2, assumimos que o conteúdo de texto já pode ser abstraído.
  // Em uma implementação futura (Fase 8.3/8.4), haverá OCR real para PDFs e imagens.
  // Por enquanto, faremos um mock de conteúdo baseado no arquivo.
  const documentContentMock = `(Conteúdo extraído simulado do documento ${attachment.fileName})`;

  const defaultPrompt = "Você é um assistente clínico. Sua tarefa é resumir o conteúdo do documento fornecido. NÃO faça interpretações fora do que está escrito.";
  const systemPrompt = await getOrCreateDefaultTemplate(tenantId, "DOCUMENT_SUMMARY", defaultPrompt, "Template padrão para resumo de documentos");

  const userPrompt = `
Documento: ${attachment.fileName}
Data: ${attachment.createdAt.toISOString()}

Conteúdo extraído:
${documentContentMock}

Por favor, faça um resumo do conteúdo deste documento.
  `;

  return requestAiAnalysis(
    tenantId,
    createdBy,
    patientId,
    "DOCUMENT_SUMMARY",
    `Resumo de Documento - ${attachment.fileName}`,
    provider,
    systemPrompt,
    userPrompt
  );
}
