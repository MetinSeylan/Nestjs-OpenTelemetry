import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ExportResult } from '@opentelemetry/core';

export class NoopTraceExporter implements SpanExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    // noop
  }

  shutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
