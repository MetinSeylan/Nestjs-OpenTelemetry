import { DynamicModule } from '@nestjs/common';
import { OpenTelemetryModuleConfig } from './OpenTelemetryModuleConfig';
import { OpenTelemetryModuleAsyncOption } from './OpenTelemetryModuleAsyncOption';
export declare class OpenTelemetryModule {
    static forRoot(configuration?: Partial<OpenTelemetryModuleConfig>): Promise<DynamicModule>;
    private static buildProvider;
    private static buildInjectors;
    static forRootAsync(configuration?: OpenTelemetryModuleAsyncOption): Promise<DynamicModule>;
    private static buildAsyncProvider;
    private static buildAsyncInjectors;
    private static buildTracer;
}
