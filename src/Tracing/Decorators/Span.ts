import { context, trace } from '@opentelemetry/api';

export function Span(name?: string) {
  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const method = propertyDescriptor.value;
    propertyDescriptor.value = function (...args: any[]) {
      const currentSpan = trace.getSpan(context.active());
      const tracer = trace.getTracer('default');

      return context.with(trace.setSpan(context.active(), currentSpan), () => {
        const span = tracer.startSpan(
          name ? name : `${target.constructor.name}.${propertyKey}`,
        );
        if (method.constructor.name === 'AsyncFunction') {
          return method.apply(this, args).finally(() => {
            span.end();
          });
        } else {
          const result = method.apply(this, args);
          span.end();
          return result;
        }
      });
    };
  };
}
