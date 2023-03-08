import { SpanExporter } from '@opentelemetry/sdk-trace-base';

export class NoopTraceExporter implements SpanExporter {
  export() {
    // noop
  }

  shutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
