import { ModuleMetadata } from '@nestjs/common';
import { OpenTelemetryModuleConfig } from './OpenTelemetryModuleConfig';

export interface OpenTelemetryModuleAsyncOption
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) =>
    | Promise<Partial<OpenTelemetryModuleConfig>>
    | Partial<OpenTelemetryModuleConfig>;
  inject?: any[];
}
