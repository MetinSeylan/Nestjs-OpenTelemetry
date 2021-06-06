import { Injectable, Logger } from '@nestjs/common';
import { context, trace } from '@opentelemetry/api';

@Injectable()
export class LoggerService extends Logger {
  constructor() {
    super();
  }

  private getTraceId(message: string, attr?) {
    const span = trace.getSpan(context.active());
    if (!span) return '';
    const spanContext = trace.getSpan(context.active()).spanContext();

    if (attr) span.setAttributes(attr);
    span.addEvent(message);

    return `[${spanContext.traceId}] `;
  }

  // @ts-ignore
  log(message: any, context?: string, attr?: Record<string, any>) {
    super.log(`${this.getTraceId(message, attr)}${message}`, context);
  }

  // @ts-ignore
  error(
    message: any,
    trace?: string,
    context?: string,
    attr?: Record<string, any>,
  ) {
    super.error(`${this.getTraceId(message, attr)}${message}`, trace, context);
  }

  // @ts-ignore
  warn(message: any, context?: string, attr?: Record<string, any>) {
    super.log(`${this.getTraceId(message, attr)}${message}`, context);
  }

  debug(message: any, context?: string, attr?: Record<string, any>) {
    super.debug(`${this.getTraceId(message, attr)}${message}`, context);
  }

  verbose(message: any, context?: string, attr?: Record<string, any>) {
    super.debug(`${this.getTraceId(message, attr)}${message}`, context);
  }
}
