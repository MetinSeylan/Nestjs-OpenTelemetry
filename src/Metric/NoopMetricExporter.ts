import { MetricExporter, MetricRecord } from '@opentelemetry/sdk-metrics-base';
import { ExportResult } from '@opentelemetry/core';

export class NoopMetricExporter implements MetricExporter {
  export(
    metrics: MetricRecord[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    // noop
  }

  shutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
