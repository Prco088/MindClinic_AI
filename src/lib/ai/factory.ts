import { AiProvider } from "@prisma/client";
import { AiProviderInterface } from "./interfaces";
import { MockAiProvider } from "./provider";

export class AiProviderFactory {
  static getProvider(provider: AiProvider): AiProviderInterface {
    switch (provider) {
      case "GEMINI":
        return new MockAiProvider("GEMINI");
      case "OPENAI":
        return new MockAiProvider("OPENAI");
      case "AZURE_OPENAI":
        return new MockAiProvider("AZURE_OPENAI");
      default:
        throw new Error(`Provider ${provider} is not supported yet.`);
    }
  }
}
