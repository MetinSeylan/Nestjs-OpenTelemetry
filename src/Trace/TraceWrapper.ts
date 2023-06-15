import { Span, SpanStatusCode, trace } from '@opentelemetry/api';
import { Constants } from '../Constants';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import type { ILogger } from './Logger.interface';

export class TraceWrapper {
  /**
   * Trace a class by wrapping all methods in a trace segment
   * @param instance Instance of the class to trace
   * @param logger Logger to use for debugging logs. Defaults to console
   * @returns The traced instance of the class
   */
  static trace<T>(instance: T, logger?: ILogger): T {
    logger = logger ?? console;
    const keys = new MetadataScanner().getAllMethodNames(
      instance.constructor.prototype,
    );
    for (const key of keys) {
      const defaultTraceName = `${instance.constructor.name}.${instance[key].name}`;
      const method = this.wrap(instance[key], defaultTraceName, {
        class: instance.constructor.name,
        method: instance[key].name,
      });
      this.reDecorate(instance[key], method);

      instance[key] = method;
      logger.debug(`Mapped ${instance.constructor.name}.${key}`, {
        class: instance.constructor.name,
        method: key,
      });
    }

    return instance;
  }

  /**
   * Wrap a method in a trace segment
   * @param prototype prototype of the method to wrap
   * @param traceName Span/Segment name
   * @param attributes Additional attributes to add to the span
   * @returns The wrapped method
   */
  static wrap(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prototype: Record<any, any>,
    traceName: string,
    attributes = {},
  ) {
    let method;

    if (prototype.constructor.name === 'AsyncFunction') {
      method = {
        [prototype.name]: async function (...args: unknown[]) {
          const tracer = trace.getTracer('default');
          return await tracer.startActiveSpan(traceName, async (span) => {
            return prototype
              .apply(this, args)
              .catch((error) => TraceWrapper.recordException(error, span))
              .finally(() => {
                span.end();
              });
          });
        },
      }[prototype.name];
    } else {
      method = {
        [prototype.name]: function (...args: unknown[]) {
          const tracer = trace.getTracer('default');
          return tracer.startActiveSpan(traceName, (span) => {
            span.setAttributes(attributes);
            try {
              span.setAttributes(attributes);
              return prototype.apply(this, args);
            } catch (error) {
              TraceWrapper.recordException(error, span);
            } finally {
              span.end();
            }
          });
        },
      }[prototype.name];
    }

    Reflect.defineMetadata(Constants.TRACE_METADATA, traceName, method);
    this.affect(method);
    this.reDecorate(prototype, method);

    return method;
  }

  protected static reDecorate(source, destination) {
    const keys = Reflect.getMetadataKeys(source);

    for (const key of keys) {
      const meta = Reflect.getMetadata(key, source);
      Reflect.defineMetadata(key, meta, destination);
    }
  }

  protected static recordException(error, span: Span) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  }

  protected static affect(prototype) {
    Reflect.defineMetadata(Constants.TRACE_METADATA_ACTIVE, 1, prototype);
  }
}
