import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { TraceService } from './Trace/TraceService';
import { Constants } from './Constants';
import { MetricService } from './Metric/MetricService';
import {
  OpenTelemetryModuleConfig,
  OpenTelemetryModuleDefaultConfig,
} from './OpenTelemetryModuleConfig';
import { FactoryProvider } from '@nestjs/common/interfaces/modules/provider.interface';
import { OpenTelemetryService } from './OpenTelemetryService';
import { OpenTelemetryModuleAsyncOption } from './OpenTelemetryModuleAsyncOption';
import { DecoratorInjector } from './Trace/Injectors/DecoratorInjector';
import { APP_INTERCEPTOR, ModuleRef } from '@nestjs/core';
import { MetricHttpMiddleware } from './Metric/Interceptors/Http/MetricHttpMiddleware';
import { MetricInterceptor } from './Metric/Interceptors/MetricInterceptor';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MetricHttpEventProducer } from './Metric/Interceptors/Http/MetricHttpEventProducer';
import { MetricGrpcEventProducer } from './Metric/Interceptors/Grpc/MetricGrpcEventProducer';
import { MetricRabbitMQEventProducer } from './Metric/Interceptors/RabbitMQ/MetricRabbitMQEventProducer';
import { DecoratorObserverMetricInjector } from './Metric/Injectors/DecoratorObserverMetricInjector';
import { DecoratorCounterMetricInjector } from './Metric/Injectors/DecoratorCounterMetricInjector';
import { Tracer } from '@opentelemetry/sdk-trace-base';

export class OpenTelemetryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricHttpMiddleware).forRoutes('*');
  }

  static async forRoot(
    configuration: Partial<OpenTelemetryModuleConfig> = {},
  ): Promise<DynamicModule> {
    configuration = { ...OpenTelemetryModuleDefaultConfig, ...configuration };
    const injectors = configuration?.traceAutoInjectors ?? [];
    const metrics = configuration?.metricAutoObservers ?? [];
    return {
      global: true,
      module: OpenTelemetryModule,
      imports: [EventEmitterModule.forRoot()],
      providers: [
        ...injectors,
        ...metrics,
        TraceService,
        MetricService,
        OpenTelemetryService,
        MetricHttpMiddleware,
        MetricHttpEventProducer,
        MetricGrpcEventProducer,
        MetricRabbitMQEventProducer,
        DecoratorInjector,
        DecoratorObserverMetricInjector,
        DecoratorCounterMetricInjector,
        this.buildProvider(configuration),
        this.buildInjectors(configuration),
        this.buildTracer(),
        {
          provide: Constants.SDK_CONFIG,
          useValue: configuration,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: MetricInterceptor,
        },
      ],
      exports: [TraceService, MetricService, Tracer],
    };
  }

  private static buildProvider(
    configuration?: Partial<OpenTelemetryModuleConfig>,
  ): FactoryProvider {
    return {
      provide: Constants.SDK,
      useFactory: async () => {
        const sdk = new NodeSDK(configuration);
        await sdk.start();
        return sdk;
      },
    };
  }

  private static buildInjectors(
    configuration?: Partial<OpenTelemetryModuleConfig>,
  ): FactoryProvider {
    const injectors = configuration?.traceAutoInjectors ?? [];
    const metrics = configuration?.metricAutoObservers ?? [];
    return {
      provide: Constants.SDK_INJECTORS,
      useFactory: async (...injectors) => {
        for await (const injector of injectors) {
          if (injector['inject']) await injector.inject();
        }
      },
      inject: [
        DecoratorInjector,
        DecoratorObserverMetricInjector,
        DecoratorCounterMetricInjector,
        // eslint-disable-next-line @typescript-eslint/ban-types
        ...(injectors as Function[]),
        // eslint-disable-next-line @typescript-eslint/ban-types
        ...(metrics as Function[]),
      ],
    };
  }

  static async forRootAsync(
    configuration: OpenTelemetryModuleAsyncOption = {},
  ): Promise<DynamicModule> {
    return {
      global: true,
      module: OpenTelemetryModule,
      imports: [...configuration?.imports, EventEmitterModule.forRoot()],
      providers: [
        TraceService,
        MetricService,
        OpenTelemetryService,
        MetricHttpMiddleware,
        MetricHttpEventProducer,
        MetricGrpcEventProducer,
        MetricRabbitMQEventProducer,
        this.buildAsyncProvider(),
        this.buildAsyncInjectors(),
        this.buildTracer(),
        {
          provide: Constants.SDK_CONFIG,
          useFactory: configuration.useFactory,
          inject: configuration.inject,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: MetricInterceptor,
        },
      ],
      exports: [TraceService, MetricService, Tracer],
    };
  }

  private static buildAsyncProvider(): FactoryProvider {
    return {
      provide: Constants.SDK,
      useFactory: async (config) => {
        config = { ...OpenTelemetryModuleDefaultConfig, ...config };
        const sdk = new NodeSDK(config);
        await sdk.start();
        return sdk;
      },
      inject: [Constants.SDK_CONFIG],
    };
  }

  private static buildAsyncInjectors(): FactoryProvider {
    return {
      provide: Constants.SDK_INJECTORS,
      useFactory: async (config, moduleRef: ModuleRef) => {
        config = { ...OpenTelemetryModuleDefaultConfig, ...config };
        const injectors =
          config.traceAutoInjectors ??
          OpenTelemetryModuleDefaultConfig.traceAutoInjectors;
        const metrics =
          config.metricAutoObservers ??
          OpenTelemetryModuleDefaultConfig.metricAutoObservers;

        const decoratorInjector = await moduleRef.create(DecoratorInjector);
        await decoratorInjector.inject();

        const decoratorObserverMetricInjector = await moduleRef.create(
          DecoratorObserverMetricInjector,
        );
        await decoratorObserverMetricInjector.inject();

        const decoratorCounterMetricInjector = await moduleRef.create(
          DecoratorCounterMetricInjector,
        );
        await decoratorCounterMetricInjector.inject();

        for await (const injector of injectors) {
          const created = await moduleRef.create(injector);
          if (created['inject']) await created.inject();
        }

        for await (const metric of metrics) {
          const createdMetric = await moduleRef.create(metric);
          if (createdMetric['inject']) await createdMetric.inject();
        }

        return {};
      },
      inject: [Constants.SDK_CONFIG, ModuleRef],
    };
  }

  private static buildTracer() {
    return {
      provide: Tracer,
      useFactory: (traceService: TraceService) => traceService.getTracer(),
      inject: [TraceService],
    };
  }
}
