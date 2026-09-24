type LogLevel = "INFO" | "WARN" | "ERROR" | "SECURITY" | "AUDIT";

export const logger = {
  log: (level: LogLevel, message: string, meta: Record<string, any> = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
    
    // Formato JSON puro para ingestão por DataDog/CloudWatch/Logstash
    const output = JSON.stringify(logEntry);
    
    if (level === "ERROR" || level === "SECURITY") {
      console.error(output);
    } else if (level === "WARN") {
      console.warn(output);
    } else {
      console.log(output);
    }
  },

  info: (message: string, meta?: Record<string, any>) => logger.log("INFO", message, meta),
  warn: (message: string, meta?: Record<string, any>) => logger.log("WARN", message, meta),
  error: (message: string, meta?: Record<string, any>) => logger.log("ERROR", message, meta),
  security: (message: string, meta?: Record<string, any>) => logger.log("SECURITY", message, meta),
  audit: (message: string, meta?: Record<string, any>) => logger.log("AUDIT", message, meta),
};
