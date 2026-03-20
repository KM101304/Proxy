export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.info(`[proxy] ${message}`, context ?? {});
  },
  error(message: string, context?: Record<string, unknown>) {
    console.error(`[proxy] ${message}`, context ?? {});
  },
};
