import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { Injector } from './Trace/Injectors/Injector';
import { BaseMetric } from './Metric/Metrics/BaseMetric';
import { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { ControllerInjector } from './Trace/Injectors/ControllerInjector';
import { GuardInjector } from './Trace/Injectors/GuardInjector';
import { EventEmitterInjector } from './Trace/Injectors/EventEmitterInjector';
import { ScheduleInjector } from './Trace/Injectors/ScheduleInjector';
import { ResourceMetric } from './Metric/Metrics/ResourceMetric';
import { PipeInjector } from './Trace/Injectors/PipeInjector';
import { LoggerInjector } from './Trace/Injectors/LoggerInjector';
import { ProcessStartTimeMetric } from './Metric/Metrics/ProcessStartTimeMetric';
import { ProcessOpenFdsMetric } from './Metric/Metrics/ProcessOpenFdsMetric';
import { ProcessMaxFdsMetric } from './Metric/Metrics/ProcessMaxFdsMetric';
import { ActiveHandlesMetric } from './Metric/Metrics/ActiveHandlesMetric';
import { ActiveHandlesTotalMetric } from './Metric/Metrics/ActiveHandlesTotalMetric';
import { HttpRequestDurationSeconds } from './Metric/Metrics/Http/HttpRequestDurationSeconds';
import { GrpcRequestDurationSeconds } from './Metric/Metrics/Grpc/GrpcRequestDurationSeconds';
import { RabbitMqRequestDurationSeconds } from './Metric/Metrics/RabbitMQ/GrpcRequestDurationSeconds';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { Resource } from '@opentelemetry/resources';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NoopSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { CompositePropagator } from '@opentelemetry/core';
export interface OpenTelemetryModuleConfig extends Partial<NodeSDKConfiguration> {
    traceAutoInjectors?: Provider<Injector>[];
    metricAutoObservers?: Provider<BaseMetric>[];
}
export declare const OpenTelemetryModuleDefaultConfig: {
    traceAutoInjectors: (typeof ControllerInjector | typeof GuardInjector | typeof EventEmitterInjector | typeof ScheduleInjector | typeof PipeInjector | typeof LoggerInjector)[];
    metricAutoObservers: (typeof ResourceMetric | typeof ProcessStartTimeMetric | typeof ProcessOpenFdsMetric | typeof ProcessMaxFdsMetric | typeof ActiveHandlesMetric | typeof ActiveHandlesTotalMetric | typeof HttpRequestDurationSeconds | typeof GrpcRequestDurationSeconds | typeof RabbitMqRequestDurationSeconds)[];
    autoDetectResources: boolean;
    contextManager: AsyncLocalStorageContextManager;
    resource: Resource;
    instrumentations: HttpInstrumentation[];
    spanProcessor: NoopSpanProcessor;
    textMapPropagator: CompositePropagator;
};
