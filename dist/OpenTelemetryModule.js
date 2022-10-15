"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetryModule = void 0;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const TraceService_1 = require("./Trace/TraceService");
const Constants_1 = require("./Constants");
const OpenTelemetryModuleConfig_1 = require("./OpenTelemetryModuleConfig");
const OpenTelemetryService_1 = require("./OpenTelemetryService");
const DecoratorInjector_1 = require("./Trace/Injectors/DecoratorInjector");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
class OpenTelemetryModule {
    static async forRoot(configuration = {}) {
        configuration = { ...OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig, ...configuration };
        const injectors = configuration?.traceAutoInjectors ?? [];
        return {
            global: true,
            module: OpenTelemetryModule,
            imports: [event_emitter_1.EventEmitterModule.forRoot()],
            providers: [
                ...injectors,
                TraceService_1.TraceService,
                OpenTelemetryService_1.OpenTelemetryService,
                this.buildProvider(configuration),
                this.buildInjectors(configuration),
                this.buildTracer(),
                {
                    provide: Constants_1.Constants.SDK_CONFIG,
                    useValue: configuration,
                },
            ],
            exports: [TraceService_1.TraceService, sdk_trace_base_1.Tracer],
        };
    }
    static buildProvider(configuration) {
        return {
            provide: Constants_1.Constants.SDK,
            useFactory: async () => {
                const sdk = new sdk_node_1.NodeSDK(configuration);
                await sdk.start();
                return sdk;
            },
        };
    }
    static buildInjectors(configuration) {
        const injectors = configuration?.traceAutoInjectors ?? [];
        return {
            provide: Constants_1.Constants.SDK_INJECTORS,
            useFactory: async (...injectors) => {
                for await (const injector of injectors) {
                    if (injector['inject'])
                        await injector.inject();
                }
            },
            inject: [
                ...injectors,
            ],
        };
    }
    static async forRootAsync(configuration = {}) {
        return {
            global: true,
            module: OpenTelemetryModule,
            imports: [...configuration?.imports, event_emitter_1.EventEmitterModule.forRoot()],
            providers: [
                TraceService_1.TraceService,
                OpenTelemetryService_1.OpenTelemetryService,
                this.buildAsyncProvider(),
                this.buildAsyncInjectors(),
                this.buildTracer(),
                {
                    provide: Constants_1.Constants.SDK_CONFIG,
                    useFactory: configuration.useFactory,
                    inject: configuration.inject,
                },
            ],
            exports: [TraceService_1.TraceService, sdk_trace_base_1.Tracer],
        };
    }
    static buildAsyncProvider() {
        return {
            provide: Constants_1.Constants.SDK,
            useFactory: async (config) => {
                config = { ...OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig, ...config };
                const sdk = new sdk_node_1.NodeSDK(config);
                await sdk.start();
                return sdk;
            },
            inject: [Constants_1.Constants.SDK_CONFIG],
        };
    }
    static buildAsyncInjectors() {
        return {
            provide: Constants_1.Constants.SDK_INJECTORS,
            useFactory: async (config, moduleRef) => {
                config = { ...OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig, ...config };
                const injectors = config.traceAutoInjectors ??
                    OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig.traceAutoInjectors;
                const decoratorInjector = await moduleRef.create(DecoratorInjector_1.DecoratorInjector);
                await decoratorInjector.inject();
                for await (const injector of injectors) {
                    const created = await moduleRef.create(injector);
                    if (created['inject'])
                        await created.inject();
                }
                return {};
            },
            inject: [Constants_1.Constants.SDK_CONFIG, core_1.ModuleRef],
        };
    }
    static buildTracer() {
        return {
            provide: sdk_trace_base_1.Tracer,
            useFactory: (traceService) => traceService.getTracer(),
            inject: [TraceService_1.TraceService],
        };
    }
}
exports.OpenTelemetryModule = OpenTelemetryModule;
//# sourceMappingURL=OpenTelemetryModule.js.map