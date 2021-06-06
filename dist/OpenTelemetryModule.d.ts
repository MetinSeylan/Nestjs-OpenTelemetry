import { DynamicModule } from '@nestjs/common';
import { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
export declare class OpenTelemetryModule {
    static register(configuration?: Partial<NodeSDKConfiguration>): Promise<DynamicModule>;
    private static createProvider;
}
