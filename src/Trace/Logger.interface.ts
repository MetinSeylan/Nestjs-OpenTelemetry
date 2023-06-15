export interface ILogger {
  debug: (message: string, params?: Record<string, unknown>) => void;
  info: (message: string, params?: Record<string, unknown>) => void;
  warn: (message: string, params?: Record<string, unknown>) => void;
  error: (
    message: string,
    err?: Error,
    params?: Record<string, unknown>,
  ) => void;
}

export interface LoggerOptions {
  componentName: string;
  logLevel?: LogLevel;
  isProduction: boolean;
  metadata?: Record<string, unknown>;
}

export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}
