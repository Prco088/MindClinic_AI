import { AiProvider } from "@prisma/client";

export interface AiModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiPromptParams {
  systemPrompt: string;
  userPrompt: string;
  config?: AiModelConfig;
}

export interface AiGenerationResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  provider: AiProvider;
  model: string;
  metadata?: Record<string, unknown>;
}

export interface AiProviderInterface {
  readonly providerName: AiProvider;
  generateText(params: AiPromptParams): Promise<AiGenerationResult>;
  generateEmbedding(text: string): Promise<number[]>;
}
