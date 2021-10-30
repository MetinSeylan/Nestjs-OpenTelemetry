import { BeforeApplicationShutdown } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
export declare class OpenTelemetryService implements BeforeApplicationShutdown {
    private readonly sdk;
    constructor(sdk: NodeSDK);
    beforeApplicationShutdown(signal?: string): Promise<void>;
}
