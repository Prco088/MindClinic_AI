import { logger } from "./logger";

export const sentryCapture = (error: Error, context?: Record<string, unknown>) => {
  // Em produção, isso enviaria para o Sentry:
  // Sentry.captureException(error, { extra: context });
  logger.error("Unhandled Exception Captured by Sentry Simulator", { 
    error: error.message, 
    stack: error.stack, 
    context 
  });
};

export const startPerformanceTransaction = (name: string) => {
  // Simula Sentry.startTransaction({ name });
  const start = Date.now();
  return {
    finish: () => {
      const duration = Date.now() - start;
      logger.info("Performance transaction finished", { name, durationMs: duration });
    }
  }
};
