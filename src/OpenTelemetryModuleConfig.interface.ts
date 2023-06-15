import type { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import type { Injector } from './Trace/Injectors/Injector';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';

export interface OpenTelemetryModuleConfig
  extends Partial<NodeSDKConfiguration> {
  traceAutoInjectors?: Provider<Injector>[];
}
