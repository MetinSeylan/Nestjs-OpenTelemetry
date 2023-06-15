import { ModuleMetadata } from '@nestjs/common';
import type { OpenTelemetryModuleConfig } from './OpenTelemetryModuleConfig.interface';

export interface OpenTelemetryModuleAsyncOption
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) =>
    | Promise<Partial<OpenTelemetryModuleConfig>>
    | Partial<OpenTelemetryModuleConfig>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
}
