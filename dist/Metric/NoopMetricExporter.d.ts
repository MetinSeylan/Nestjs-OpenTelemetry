import { MetricExporter, MetricRecord } from '@opentelemetry/sdk-metrics-base';
import { ExportResult } from '@opentelemetry/core';
export declare class NoopMetricExporter implements MetricExporter {
    export(metrics: MetricRecord[], resultCallback: (result: ExportResult) => void): void;
    shutdown(): Promise<void>;
}
