import { AiAnalysisType, AiProvider } from "@prisma/client";

export type AiAnalysisRequest = {
  tenantId: string;
  patientId?: string;
  createdBy: string;
  type: AiAnalysisType;
  title: string;
  provider: AiProvider;
  systemPrompt: string;
  userPrompt: string;
  metadata?: Record<string, unknown>;
};

export type AiJobContext = {
  jobId: string;
  analysisId: string;
  tenantId: string;
};
