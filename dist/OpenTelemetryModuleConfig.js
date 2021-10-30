"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetryModuleDefaultConfig = void 0;
const ControllerInjector_1 = require("./Trace/Injectors/ControllerInjector");
const GuardInjector_1 = require("./Trace/Injectors/GuardInjector");
const EventEmitterInjector_1 = require("./Trace/Injectors/EventEmitterInjector");
const ScheduleInjector_1 = require("./Trace/Injectors/ScheduleInjector");
const ResourceMetric_1 = require("./Metric/Metrics/ResourceMetric");
const PipeInjector_1 = require("./Trace/Injectors/PipeInjector");
const LoggerInjector_1 = require("./Trace/Injectors/LoggerInjector");
const ProcessStartTimeMetric_1 = require("./Metric/Metrics/ProcessStartTimeMetric");
const ProcessOpenFdsMetric_1 = require("./Metric/Metrics/ProcessOpenFdsMetric");
const ProcessMaxFdsMetric_1 = require("./Metric/Metrics/ProcessMaxFdsMetric");
const ActiveHandlesMetric_1 = require("./Metric/Metrics/ActiveHandlesMetric");
const ActiveHandlesTotalMetric_1 = require("./Metric/Metrics/ActiveHandlesTotalMetric");
const HttpRequestDurationSeconds_1 = require("./Metric/Metrics/Http/HttpRequestDurationSeconds");
const GrpcRequestDurationSeconds_1 = require("./Metric/Metrics/Grpc/GrpcRequestDurationSeconds");
const GrpcRequestDurationSeconds_2 = require("./Metric/Metrics/RabbitMQ/GrpcRequestDurationSeconds");
const context_async_hooks_1 = require("@opentelemetry/context-async-hooks");
const resources_1 = require("@opentelemetry/resources");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const core_1 = require("@opentelemetry/core");
const propagator_jaeger_1 = require("@opentelemetry/propagator-jaeger");
const propagator_b3_1 = require("@opentelemetry/propagator-b3");
exports.OpenTelemetryModuleDefaultConfig = {
    traceAutoInjectors: [
        ControllerInjector_1.ControllerInjector,
        GuardInjector_1.GuardInjector,
        EventEmitterInjector_1.EventEmitterInjector,
        ScheduleInjector_1.ScheduleInjector,
        PipeInjector_1.PipeInjector,
        LoggerInjector_1.LoggerInjector,
    ],
    metricAutoObservers: [
        ResourceMetric_1.ResourceMetric,
        ProcessStartTimeMetric_1.ProcessStartTimeMetric,
        ProcessOpenFdsMetric_1.ProcessOpenFdsMetric,
        ProcessMaxFdsMetric_1.ProcessMaxFdsMetric,
        ActiveHandlesMetric_1.ActiveHandlesMetric,
        ActiveHandlesTotalMetric_1.ActiveHandlesTotalMetric,
        HttpRequestDurationSeconds_1.HttpRequestDurationSeconds,
        GrpcRequestDurationSeconds_1.GrpcRequestDurationSeconds,
        GrpcRequestDurationSeconds_2.RabbitMqRequestDurationSeconds,
    ],
    autoDetectResources: true,
    contextManager: new context_async_hooks_1.AsyncLocalStorageContextManager(),
    resource: new resources_1.Resource({
        lib: '@metinseylan/nestjs-opentelemetry',
    }),
    instrumentations: [new instrumentation_http_1.HttpInstrumentation()],
    spanProcessor: new sdk_trace_base_1.NoopSpanProcessor(),
    textMapPropagator: new core_1.CompositePropagator({
        propagators: [
            new propagator_jaeger_1.JaegerPropagator(),
            new propagator_b3_1.B3Propagator(),
            new propagator_b3_1.B3Propagator({
                injectEncoding: propagator_b3_1.B3InjectEncoding.MULTI_HEADER,
            }),
        ],
    }),
};
//# sourceMappingURL=OpenTelemetryModuleConfig.js.map