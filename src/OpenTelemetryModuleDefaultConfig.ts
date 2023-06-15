import { ControllerInjector } from './Trace/Injectors/ControllerInjector';
import { GuardInjector } from './Trace/Injectors/GuardInjector';
import { EventEmitterInjector } from './Trace/Injectors/EventEmitterInjector';
import { ScheduleInjector } from './Trace/Injectors/ScheduleInjector';
import { PipeInjector } from './Trace/Injectors/PipeInjector';
import { ConsoleLoggerInjector } from './Trace/Injectors/ConsoleLoggerInjector';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { Resource } from '@opentelemetry/resources';
import { NoopSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { CompositePropagator } from '@opentelemetry/core';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { containerDetector } from '@opentelemetry/resource-detector-container';

import { Span } from '@opentelemetry/api';
import { ClientRequest } from 'http';
import { OpenTelemetryModuleConfig } from './OpenTelemetryModuleConfig.interface';

export const OpenTelemetryModuleDefaultConfig = <OpenTelemetryModuleConfig>{
  serviceName: 'UNKNOWN',
  traceAutoInjectors: [
    ControllerInjector,
    GuardInjector,
    EventEmitterInjector,
    ScheduleInjector,
    PipeInjector,
    ConsoleLoggerInjector,
  ],
  autoDetectResources: false,
  resourceDetectors: [containerDetector],
  contextManager: new AsyncLocalStorageContextManager(),
  resource: new Resource({
    lib: '@overbit/opentelemetry-nestjs',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        requireParentSpan: true,
        enabled: true,
        createHook: (funtionName, { args }) => {
          // Ignore node_modules
          return !args[0].toString().indexOf('node_modules');
        },
        endHook: (funtionName, { args, span }) => {
          span.setAttribute('file', args[0].toString());
        },
      },
      '@opentelemetry/instrumentation-http': {
        requireParentforOutgoingSpans: true,
        requestHook: (span: Span, request: ClientRequest) => {
          span.updateName(`${request.method} ${request.path}`);
        },
        enabled: true,
        ignoreIncomingPaths: ['/health'],
      },
      '@opentelemetry/instrumentation-net': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-graphql': {
        enabled: true,
        mergeItems: true,
        ignoreTrivialResolveSpans: true,
        depth: 2,
      },
    }),
  ],
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
