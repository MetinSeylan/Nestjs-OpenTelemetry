import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { OpenTelemetryModuleConfig } from './OpenTelemetryModuleConfig';
import { OpenTelemetryModuleAsyncOption } from './OpenTelemetryModuleAsyncOption';
export declare class OpenTelemetryModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
    static forRoot(configuration?: Partial<OpenTelemetryModuleConfig>): Promise<DynamicModule>;
    private static buildProvider;
    private static buildInjectors;
    static forRootAsync(configuration?: OpenTelemetryModuleAsyncOption): Promise<DynamicModule>;
    private static buildAsyncProvider;
    private static buildAsyncInjectors;
    private static buildMeter;
    private static buildTracer;
}
