import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { Injector } from './Trace/Injectors/Injector';
import { BaseMetric } from './Metric/Metrics/BaseMetric';
import { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { ControllerInjector } from './Trace/Injectors/ControllerInjector';
import { GuardInjector } from './Trace/Injectors/GuardInjector';
import { EventEmitterInjector } from './Trace/Injectors/EventEmitterInjector';
import { ScheduleInjector } from './Trace/Injectors/ScheduleInjector';
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
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';

export interface OpenTelemetryModuleConfig
  extends Partial<NodeSDKConfiguration> {
  traceAutoInjectors?: Provider<Injector>[];
  metricAutoObservers?: Provider<BaseMetric>[];
}

export const OpenTelemetryModuleDefaultConfig = {
  traceAutoInjectors: [
    ControllerInjector,
    GuardInjector,
    EventEmitterInjector,
    ScheduleInjector,
    PipeInjector,
    LoggerInjector,
  ],
  metricAutoObservers: [
    ProcessStartTimeMetric,
    ProcessOpenFdsMetric,
    ProcessMaxFdsMetric,
    ActiveHandlesMetric,
    ActiveHandlesTotalMetric,
    HttpRequestDurationSeconds,
    GrpcRequestDurationSeconds,
    RabbitMqRequestDurationSeconds,
  ],
  autoDetectResources: true,
  contextManager: new AsyncLocalStorageContextManager(),
  resource: new Resource({
    lib: '@metinseylan/nestjs-opentelemetry',
  }),
  instrumentations: [new HttpInstrumentation()],
  spanProcessor: new NoopSpanProcessor(),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new JaegerPropagator(),
      new B3Propagator(),
      new B3Propagator({
        injectEncoding: B3InjectEncoding.MULTI_HEADER,
      }),
    ],
  }),
};
