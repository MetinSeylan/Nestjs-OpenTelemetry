import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Injector } from './Injector';
import { context, trace } from '@opentelemetry/api';

@Injectable()
export class ConsoleLoggerInjector implements Injector {
  public inject() {
    ConsoleLogger.prototype.log = this.wrapPrototype(
      ConsoleLogger.prototype.log,
    );
    ConsoleLogger.prototype.debug = this.wrapPrototype(
      ConsoleLogger.prototype.debug,
    );
    ConsoleLogger.prototype.error = this.wrapPrototype(
      ConsoleLogger.prototype.error,
    );
    ConsoleLogger.prototype.verbose = this.wrapPrototype(
      ConsoleLogger.prototype.verbose,
    );
    ConsoleLogger.prototype.warn = this.wrapPrototype(
      ConsoleLogger.prototype.warn,
    );
  }

  private wrapPrototype(prototype) {
    return {
      [prototype.name]: function (...args: any[]) {
        args[0] = ConsoleLoggerInjector.getMessage(args[0]);
        prototype.apply(this, args);
      },
    }[prototype.name];
  }

  private static getMessage(message: string) {
    const currentSpan = trace.getSpan(context.active());
    if (!currentSpan) return message;

    const spanContext = trace.getSpan(context.active()).spanContext();
    currentSpan.addEvent(message);

    return `[${spanContext.traceId}] ${message}`;
  }
}
