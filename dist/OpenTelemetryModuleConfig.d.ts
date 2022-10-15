import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { Injector } from './Trace/Injectors/Injector';
import { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
export interface OpenTelemetryModuleConfig extends Partial<NodeSDKConfiguration> {
    traceAutoInjectors?: Provider<Injector>[];
}
export declare const OpenTelemetryModuleDefaultConfig: OpenTelemetryModuleConfig;
