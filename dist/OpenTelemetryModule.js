"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetryModule = void 0;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const TraceService_1 = require("./Trace/TraceService");
const Constants_1 = require("./Constants");
const MetricService_1 = require("./Metric/MetricService");
const OpenTelemetryModuleConfig_1 = require("./OpenTelemetryModuleConfig");
const OpenTelemetryService_1 = require("./OpenTelemetryService");
const DecoratorInjector_1 = require("./Trace/Injectors/DecoratorInjector");
const core_1 = require("@nestjs/core");
const MetricHttpMiddleware_1 = require("./Metric/Interceptors/Http/MetricHttpMiddleware");
const MetricInterceptor_1 = require("./Metric/Interceptors/MetricInterceptor");
const event_emitter_1 = require("@nestjs/event-emitter");
const MetricHttpEventProducer_1 = require("./Metric/Interceptors/Http/MetricHttpEventProducer");
const MetricGrpcEventProducer_1 = require("./Metric/Interceptors/Grpc/MetricGrpcEventProducer");
const MetricRabbitMQEventProducer_1 = require("./Metric/Interceptors/RabbitMQ/MetricRabbitMQEventProducer");
const DecoratorObserverMetricInjector_1 = require("./Metric/Injectors/DecoratorObserverMetricInjector");
const DecoratorCounterMetricInjector_1 = require("./Metric/Injectors/DecoratorCounterMetricInjector");
const sdk_metrics_base_1 = require("@opentelemetry/sdk-metrics-base");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
class OpenTelemetryModule {
    configure(consumer) {
        consumer.apply(MetricHttpMiddleware_1.MetricHttpMiddleware).forRoutes('*');
    }
    static async forRoot(configuration = {}) {
        configuration = { ...OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig, ...configuration };
        const injectors = configuration?.traceAutoInjectors ?? [];
        const metrics = configuration?.metricAutoObservers ?? [];
        return {
            global: true,
            module: OpenTelemetryModule,
            imports: [event_emitter_1.EventEmitterModule.forRoot()],
            providers: [
                ...injectors,
                ...metrics,
                TraceService_1.TraceService,
                MetricService_1.MetricService,
                OpenTelemetryService_1.OpenTelemetryService,
                MetricHttpMiddleware_1.MetricHttpMiddleware,
                MetricHttpEventProducer_1.MetricHttpEventProducer,
                MetricGrpcEventProducer_1.MetricGrpcEventProducer,
                MetricRabbitMQEventProducer_1.MetricRabbitMQEventProducer,
                DecoratorInjector_1.DecoratorInjector,
                DecoratorObserverMetricInjector_1.DecoratorObserverMetricInjector,
                DecoratorCounterMetricInjector_1.DecoratorCounterMetricInjector,
                this.buildProvider(configuration),
                this.buildInjectors(configuration),
                this.buildMeter(),
                this.buildTracer(),
                {
                    provide: Constants_1.Constants.SDK_CONFIG,
                    useValue: configuration,
                },
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: MetricInterceptor_1.MetricInterceptor,
                },
            ],
            exports: [TraceService_1.TraceService, MetricService_1.MetricService, sdk_metrics_base_1.Meter, sdk_trace_base_1.Tracer],
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
        const metrics = configuration?.metricAutoObservers ?? [];
        return {
            provide: Constants_1.Constants.SDK_INJECTORS,
            useFactory: async (...injectors) => {
                for await (const injector of injectors) {
                    if (injector['inject'])
                        await injector.inject();
                }
            },
            inject: [
                DecoratorInjector_1.DecoratorInjector,
                DecoratorObserverMetricInjector_1.DecoratorObserverMetricInjector,
                DecoratorCounterMetricInjector_1.DecoratorCounterMetricInjector,
                ...injectors,
                ...metrics,
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
                MetricService_1.MetricService,
                OpenTelemetryService_1.OpenTelemetryService,
                MetricHttpMiddleware_1.MetricHttpMiddleware,
                MetricHttpEventProducer_1.MetricHttpEventProducer,
                MetricGrpcEventProducer_1.MetricGrpcEventProducer,
                MetricRabbitMQEventProducer_1.MetricRabbitMQEventProducer,
                this.buildAsyncProvider(),
                this.buildAsyncInjectors(),
                this.buildMeter(),
                this.buildTracer(),
                {
                    provide: Constants_1.Constants.SDK_CONFIG,
                    useFactory: configuration.useFactory,
                    inject: configuration.inject,
                },
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: MetricInterceptor_1.MetricInterceptor,
                },
            ],
            exports: [TraceService_1.TraceService, MetricService_1.MetricService, sdk_metrics_base_1.Meter, sdk_trace_base_1.Tracer],
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
                const metrics = config.metricAutoObservers ??
                    OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig.metricAutoObservers;
                const decoratorInjector = await moduleRef.create(DecoratorInjector_1.DecoratorInjector);
                await decoratorInjector.inject();
                const decoratorObserverMetricInjector = await moduleRef.create(DecoratorObserverMetricInjector_1.DecoratorObserverMetricInjector);
                await decoratorObserverMetricInjector.inject();
                const decoratorCounterMetricInjector = await moduleRef.create(DecoratorCounterMetricInjector_1.DecoratorCounterMetricInjector);
                await decoratorCounterMetricInjector.inject();
                for await (const injector of injectors) {
                    const created = await moduleRef.create(injector);
                    if (created['inject'])
                        await created.inject();
                }
                for await (const metric of metrics) {
                    const createdMetric = await moduleRef.create(metric);
                    if (createdMetric['inject'])
                        await createdMetric.inject();
                }
                return {};
            },
            inject: [Constants_1.Constants.SDK_CONFIG, core_1.ModuleRef],
        };
    }
    static buildMeter() {
        return {
            provide: sdk_metrics_base_1.Meter,
            useFactory: (metricService) => metricService.getMeter(),
            inject: [MetricService_1.MetricService],
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