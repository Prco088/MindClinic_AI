import { AiProvider } from "@prisma/client";
import { AiGenerationResult, AiPromptParams, AiProviderInterface } from "./interfaces";

export abstract class BaseAiProvider implements AiProviderInterface {
  abstract readonly providerName: AiProvider;
  
  abstract generateText(params: AiPromptParams): Promise<AiGenerationResult>;
}

// Mock Implementation for Phase 8.1
export class MockAiProvider extends BaseAiProvider {
  constructor(public readonly providerName: AiProvider) {
    super();
  }

  async generateText(params: AiPromptParams): Promise<AiGenerationResult> {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      text: `[MOCKED RESPONSE FROM ${this.providerName}]\n\nSystem: ${params.systemPrompt}\nUser: ${params.userPrompt}\n\nThis is a mock generation for Phase 8.1 architecture.`,
      inputTokens: params.userPrompt.length + params.systemPrompt.length,
      outputTokens: 50,
      provider: this.providerName,
      model: params.config?.model || "mock-model",
      metadata: { mock: true }
    };
  }
}
