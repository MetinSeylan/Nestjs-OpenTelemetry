# NestJS OpenTelemetry

<p align="center">
<a href="https://www.npmjs.com/package/@overbit/opentelemetry-nestjs"><img src="https://img.shields.io/npm/v/@overbit/opentelemetry-nestjs.svg"/> <img src="https://img.shields.io/npm/dt/@overbit/opentelemetry-nestjs.svg"/></a>
<a href="https://github.com/overbit/opentelemetry-nestjs"><img src="https://img.shields.io/npm/l/@overbit/opentelemetry-nestjs.svg"/></a>
<a href="https://github.com/overbit/opentelemetry-nestjs"><img src="https://img.shields.io/github/stars/overbit/opentelemetry-nestjs.svg"/></a>
</p>

This library, initially forked from [@metinseylan/nestjs-opentelemetry](https://github.com/MetinSeylan/Nestjs-OpenTelemetry) (whom it goes a big thank you), provides deeply integrated protocol-agnostic Nestjs [OpenTelemetry](https://opentelemetry.io/) instrumentations, metrics and SDK.

### Description

Nestjs is a protocol-agnostic framework. That's why this library can able to work with different protocols like RabbitMQ, GRPC and HTTP. Also you can observe and trace Nestjs specific layers like [Pipe](https://docs.nestjs.com/pipes), [Guard](https://docs.nestjs.com/guards), [Controller](https://docs.nestjs.com/controllers) and [Provider](https://docs.nestjs.com/providers).

It also includes auto trace and metric instrumentations for some popular Nestjs libraries.

- #### Distributed Tracing
  - [Setup](#distributed-tracing-1)
  - [Decorators](#trace-decorators)
  - [Trace Providers](#trace-providers)
  - [Auto Trace Instrumentations](#auto-trace-instrumentations)
  - [Distributed Logging with Trace ID](#distributed-logging-with-trace-id)
- #### Metrics
  - [Setup](#metrics-1)

OpenTelemetry Metrics currently experimental. So, this library doesn't support metric decorators and Auto Observers until it's stable. but if you want to use it, you can use OpenTelemetry API directly.

Competability table for Nestjs versions.

| Nestjs | Nestjs-OpenTelemetry |
| ------ | -------------------- |
| 9.x    | 3.x.x                |
| 8.x    | 2.x.x                |

### Installation

```bash
npm install @overbit/opentelemetry-nestjs --save
```

---

### Configuration

This is a basic configuration without any trace and metric exporter, but includes default metrics and injectors

```ts
import { OpenTelemetryModule } from '@overbit/opentelemetry-nestjs';

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      serviceName: 'nestjs-opentelemetry-example',
    }),
  ],
})
export class AppModule {}
```

Async configuration example

```ts
import { OpenTelemetryModule } from '@overbit/opentelemetry-nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    OpenTelemetryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        serviceName: configService.get('SERVICE_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

#### Default Parameters

| key                 | value                                                                                                                                                                                                                    | description                                                                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| traceAutoInjectors  | ControllerInjector, GuardInjector, EventEmitterInjector, ScheduleInjector, PipeInjector, LoggerInjector                                                                                                                  | default auto trace instrumentations                                                                                                                                                                                                                                       |
| metricAutoObservers | ResourceMetric, ProcessStartTimeMetric, ProcessOpenFdsMetric, ProcessMaxFdsMetric, ActiveHandlesMetric, ActiveHandlesTotalMetric, HttpRequestDurationSeconds, GrpcRequestDurationSeconds, RabbitMqRequestDurationSeconds | default auto metric collectors                                                                                                                                                                                                                                            |     | inherited from <a href="https://github.com/open-telemetry/opentelemetry-js/blob/745bd5c34d3961dc73873190adc763747e5e026d/experimental/packages/opentelemetry-sdk-node/src/types.ts#:~:text=NodeSDKConfiguration">NodeSDKConfiguration</a> |
| contextManager      | AsyncLocalStorageContextManager                                                                                                                                                                                          | default trace context manager inherited from <a href="https://github.com/open-telemetry/opentelemetry-js/blob/745bd5c34d3961dc73873190adc763747e5e026d/experimental/packages/opentelemetry-sdk-node/src/types.ts#:~:text=NodeSDKConfiguration"> NodeSDKConfiguration </a> |
| instrumentations    | AutoInstrumentations                                                                                                                                                                                                     | default instrumentations inherited from <a href="https://github.com/open-telemetry/opentelemetry-js/blob/745bd5c34d3961dc73873190adc763747e5e026d/experimental/packages/opentelemetry-sdk-node/src/types.ts#:~:text=NodeSDKConfiguration"> NodeSDKConfiguration </a>      |
| spanProcessor       | NoopSpanProcessor                                                                                                                                                                                                        | default spanProcessor inherited from <a href="https://github.com/open-telemetry/opentelemetry-js/blob/745bd5c34d3961dc73873190adc763747e5e026d/experimental/packages/opentelemetry-sdk-node/src/types.ts#:~:text=NodeSDKConfiguration"> NodeSDKConfiguration </a>         |
| textMapPropagator   | JaegerPropagator, B3Propagator                                                                                                                                                                                           | default textMapPropagator inherited from <a href="https://github.com/open-telemetry/opentelemetry-js/blob/745bd5c34d3961dc73873190adc763747e5e026d/experimental/packages/opentelemetry-sdk-node/src/types.ts#:~:text=NodeSDKConfiguration"> NodeSDKConfiguration </a>     |

`OpenTelemetryModule.forRoot()` takes [OpenTelemetryModuleConfig](https://github.com/overbit/opentelemetry-nestjs/blob/main/src/OpenTelemetryModuleConfig.ts#L25) as a parameter, this type is inherited by [NodeSDKConfiguration](https://github.com/open-telemetry/opentelemetry-js/blob/745bd5c34d3961dc73873190adc763747e5e026d/experimental/packages/opentelemetry-sdk-node/src/types.ts#:~:text=NodeSDKConfiguration) so you can use same OpenTelemetry SDK parameter.

---

### Distributed Tracing

Simple setup with Zipkin exporter, including with default trace instrumentations.

```ts
import { OpenTelemetryModule } from '@overbit/opentelemetry-nestjs';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      spanProcessor: new SimpleSpanProcessor(
        new ZipkinExporter({
          url: 'your-zipkin-url',
        }),
      ),
    }),
  ],
})
export class AppModule {}
```

After setup, your application will be instrumented, so that you can see almost every layer of application in ZipkinUI, including Guards, Pipes, Controllers even global layers like this

![Example trace output](./docs/trace-flow.jpeg)

List of supported official exporters [here](https://opentelemetry.io/docs/js/exporters/).

---

#### Trace Decorators

This library supports auto instrumentations for Nestjs layers, but sometimes you need to define custom span for specific method blocks like providers methods. In this case `@Span` decorator will help you.

```ts
import { Injectable } from '@nestjs/common';
import { Span } from '@overbit/opentelemetry-nestjs';

@Injectable()
export class AppService {
  @Span()
  getHello(): string {
    return 'Hello World!';
  }
}
```

Also `@Span` decorator takes `name` field as a parameter

```ts
@Span('hello')
```

---

#### Trace Providers

In an advanced usage case, you need to access the native OpenTelemetry Trace provider to access them from Nestjs application context.

```ts
import { Injectable } from '@nestjs/common';
import { Tracer } from '@opentelemetry/sdk-trace-base';

@Injectable()
export class AppService {
  constructor(private readonly tracer: Tracer) {}

  getHello(): string {
    const span = this.tracer.startSpan('important_section_start');
    // do something important
    span.setAttributes({ userId: 1150 });
    span.end();
    return 'Hello World!';
  }
}
```

`TraceService` can access directly current span context and start new span.

```ts
import { Injectable } from '@nestjs/common';
import { TraceService } from '@overbit/opentelemetry-nestjs';

@Injectable()
export class AppService {
  constructor(private readonly traceService: TraceService) {}

  getHello(): string {
    const span = this.traceService.startSpan('hello');
    // do something
    span.end();
    return 'Hello World!';
  }
}
```

---

#### Auto Trace Instrumentations

The most helpful part of this library is that you already get all of the instrumentations by default if you set up a module without any extra configuration. If you need to avoid some of them, you can use the `traceAutoInjectors` parameter.

```ts
import { Module } from '@nestjs/common';
import {
  OpenTelemetryModule,
  ControllerInjector,
  EventEmitterInjector,
  GuardInjector,
  LoggerInjector,
  PipeInjector,
  ScheduleInjector,
} from '@overbit/opentelemetry-nestjs';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      traceAutoInjectors: [
        ControllerInjector,
        GuardInjector,
        EventEmitterInjector,
        ScheduleInjector,
        PipeInjector,
        LoggerInjector,
      ],
      spanProcessor: new SimpleSpanProcessor(
        new ZipkinExporter({
          url: 'your-zipkin-url',
        }),
      ),
    }),
  ],
})
export class AppModule {}
```

#### List of Trace Injectors

| Instance               | Description                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ControllerInjector`   | Auto trace all of module controllers                                                                                                                                                                               |
| `GuardInjector`        | Auto trace all of module guards including global guards                                                                                                                                                            |
| `PipeInjector`         | Auto trace all of module pipes including global pipes                                                                                                                                                              |
| `EventEmitterInjector` | Auto trace for [@nestjs/event-emitter](https://docs.nestjs.com/techniques/events) library, supports all features                                                                                                   |
| `ScheduleInjector`     | Auto trace for [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling) library, supports all features                                                                                               |
| `LoggerInjector`       | [ConsoleLogger](https://docs.nestjs.com/techniques/logger#extend-built-in-logger) and [Logger](https://docs.nestjs.com/techniques/logger#using-the-logger-for-application-logging) class tracer, logs with traceId |

---

#### Distributed Logging with Trace ID

When you set up your environment with the `LoggerInjector` class or default configuration, you can see trace id with every log.

![Example trace output](./docs/log.png)

---

### Metrics

Simple setup with Prometheus exporter, you need install [@opentelemetry/exporter-prometheus](https://www.npmjs.com/package/@opentelemetry/exporter-prometheus)

```ts
import { OpenTelemetryModule } from '@overbit/opentelemetry-nestjs';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      serviceName: 'nestjs-opentelemetry-example',
      metricReader: new PrometheusExporter({
        endpoint: 'metrics',
        port: 9464,
      }),
    }),
  ],
})
export class AppModule {}
```

Now you can access Prometheus exporter with auto collected metrics [http://localhost:9464/metrics](http://localhost:9464/metrics).
Also, you can find different exporters [here](https://opentelemetry.io/docs/js/exporters/)

---

### Metric Decorators (Deprecated)

If you need to observe simple block of function, you can use some basic decorators like `@Counter` and `@Observer`

#### Counter

```ts
import { Injectable } from '@nestjs/common';
import { Counter } from '@overbit/opentelemetry-nestjs';

@Injectable()
export class AppService {
  @Counter()
  getHello(): string {
    return 'Hello World!';
  }
}
```

`@Counter` decorator is uses OpenTelemetry `Counter` metric, If you check prometheus exporter you will see metric `appservice_gethello_total`

```ts
@Counter('call_me_mr_fahrenheit', {
  description: 'important function call counting here.'
})
```

And of course, you can configure your decorator metric, the first parameter is "name" and the second one is [MetricOptions](https://github.com/open-telemetry/opentelemetry-js/blob/357ec92e95e03b4d2309c65ffb17d06105985628/experimental/packages/opentelemetry-api-metrics/src/types/Metric.ts#L29)

#### Observer (Deprecated)

```ts
import { Injectable } from '@nestjs/common';
import { Observer } from './Observer';

@Injectable()
export class AppService {
  @Observer('nice_one_observer', {
    description: 'some description here.',
    boundaries: [10, 20, 30],
  })
  getHello(): string {
    return 'Hello World!';
  }
}
```

`@Observer` decorator uses OpenTelemetry `ValueRecorder` metric. If you check Prometheus exporter, you will see metric and configuration parameters same as `@Counter`.

---

### Metric Providers (Deprecated)

In advanced usage cases, you need to access the native OpenTelemetry Metric provider to access them from the Nestjs application context.

```ts
import { Injectable } from '@nestjs/common';
import { Meter } from '@opentelemetry/sdk-metrics-base';
import { Counter } from '@opentelemetry/api-metrics';

@Injectable()
export class AppService {
  private readonly counter: Counter;

  constructor(private readonly meter: Meter) {
    this.counter = this.meter.createCounter('handsome_counter');
  }

  getHello(): string {
    this.counter.add(1);
    return 'Hello World!';
  }
}
```

---

### Auto Metric Observers (Deprecated)

This library has extendable resource and protocol-specific Auto Observers. All of them come with default module configuration, which you can extend and configure.

```ts
import { Module } from '@nestjs/common';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {
  ActiveHandlesMetric,
  HttpRequestDurationSeconds,
  OpenTelemetryModule,
} from '@overbit/opentelemetry-nestjs';

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      serviceName: 'nestjs-opentelemetry-example',
      metricAutoObservers: [
        HttpRequestDurationSeconds.build({
          boundaries: [20, 30, 100],
        }),
        ActiveHandlesMetric,
      ],
      metricReader: new PrometheusExporter({
        endpoint: 'metrics',
        port: 9464,
      }),
    }),
  ],
})
export class AppModule {}
```

`.build` function takes [MetricOptions](https://github.com/open-telemetry/opentelemetry-js/blob/357ec92e95e03b4d2309c65ffb17d06105985628/experimental/packages/opentelemetry-api-metrics/src/types/Metric.ts#L29) as a parameter.

#### List Of Auto Observers (Deprecated)

| Metric Observer Provider         | Description                                                                                 | Configurable |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| `HttpRequestDurationSeconds`     | Observe http request duration                                                               | yes          |
| `GrpcRequestDurationSeconds`     | Observe grpc request duration                                                               | yes          |
| `RabbitMqRequestDurationSeconds` | Observe rabbitmq request duration                                                           | yes          |
| `ResourceMetric`                 | Metrics of cpu, memory usage                                                                | no           |
| `ProcessStartTimeMetric`         | Start time of the process since unix epoch in seconds.                                      | no           |
| `ProcessOpenFdsMetric`           | Number of open file descriptors.                                                            | no           |
| `ProcessMaxFdsMetric`            | Maximum number of open file descriptors.                                                    | no           |
| `ActiveHandlesMetric`            | Number of active libuv handles grouped by handle type. Every handle type is C++ class name. | no           |
| `ActiveHandlesTotalMetric`       | Total number of active handles.                                                             | no           |

#### Example Output for `HttpRequestDurationSeconds`

| Key       | Value                                                           |
| --------- | --------------------------------------------------------------- |
| exception | Empty string or exception instance name                         |
| method    | GET, POST, PUT, PATCH, DELETE                                   |
| outcome   | INFORMATIONAL, SUCCESS, REDIRECTION, CLIENT_ERROR, SERVER_ERROR |
| status    | number of HttpStatus                                            |
| uri       | url path                                                        |

---

### Let's Combine All of them

```ts
import { Module } from '@nestjs/common';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OpenTelemetryModule } from '@overbit/opentelemetry-nestjs';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      serviceName: 'nestjs-opentelemetry-example',
      metricReader: new PrometheusExporter({
        endpoint: 'metrics',
        port: 9464,
      }),
      spanProcessor: new SimpleSpanProcessor(
        new ZipkinExporter({
          url: 'your-zipkin-url',
        }),
      ),
    }),
  ],
})
export class AppModule {}
```
