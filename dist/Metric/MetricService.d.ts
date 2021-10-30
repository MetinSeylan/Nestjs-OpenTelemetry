import { OpenTelemetryModuleConfig } from '../OpenTelemetryModuleConfig';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Meter, MeterProvider } from '@opentelemetry/sdk-metrics-base';
export declare class MetricService {
    private readonly sdkConfig;
    private readonly nodeSDK;
    private readonly meterProvider;
    constructor(sdkConfig: OpenTelemetryModuleConfig, nodeSDK: NodeSDK);
    getMeter(): Meter;
    getProvider(): MeterProvider;
    getLabels(): Record<string, any>;
}
