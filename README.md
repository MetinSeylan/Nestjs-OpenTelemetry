<p align="center">
  <img alt="NestJS OpenTelemetry logo" src="./docs/logo.png"/>
</p>

<h1 align="center">NestJS OpenTelemetry</h1>
<p align="center">
<a href="https://www.npmjs.com/package/@metinseylan/nestjs-opentelemetry"><img src="https://img.shields.io/npm/v/@metinseylan/nestjs-opentelemetry.svg"/> <img src="https://img.shields.io/npm/dt/@metinseylan/nestjs-opentelemetry.svg"/></a>
<a href="https://github.com/MetinSeylan/Nestjs-OpenTelemetry"><img src="https://img.shields.io/npm/l/@metinseylan/nestjs-opentelemetry.svg"/></a>
<a href="https://github.com/MetinSeylan/Nestjs-OpenTelemetry"><img src="https://img.shields.io/github/stars/MetinSeylan/nestjs-opentelemetry.svg"/></a>
</p>
<p>This library provides <a href="https://opentelemetry.io/">OpenTelemetry</a> SDK for Nestjs environment, TraceId injection, custom Span decorator, Logger and etc.</p>

#### 🚀 Installation
``` bash
npm install @metinseylan/nestjs-opentelemetry --save
```

#### 💾 Example Module Setup
According to your setup, dependencies may be different
``` bash
npm install --save \
  @opentelemetry/instrumentation-http \
  @opentelemetry/context-async-hooks \
  @opentelemetry/propagator-b3 \
  @opentelemetry/tracing \
  @opentelemetry/exporter-zipkin \
```
Module should be imported to main nestjs module. Register method accepts <a href="https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-node">OpenTelemetry NodeSDK</a> configuration
``` typescript
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { CompositePropagator } from '@opentelemetry/core';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

OpenTelemetryModule.register({
  spanProcessor: new BatchSpanProcessor(
    new ZipkinExporter({ serviceName: 'MAVI_VATAN' }),
  ),
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new B3Propagator(),
      new B3Propagator({
        injectEncoding: B3InjectEncoding.MULTI_HEADER,
      }),
    ],
  }),
  instrumentations: [new HttpInstrumentation()],
});
```
#### 🧐 Logging with TraceId
After module setup you can use LoggerService, it provides trace id with every logging like this
``` typescript
import { LoggerService } from '@metinseylan/nestjs-opentelemetry';

this.loggerService.log(
    'hello its firs logging with trace id',
    'AppService',
);
```
<img src="./docs/logging.png"  alt="Logging with opentelemetry trace id"/>

#### 🥫 Span Decorator
If you need, you can define a custom Tracing Span for a method. It works async or normally. Span takes its name from the parameter; but by default, it is the same as the method's name

``` typescript
import { Span } from '@metinseylan/nestjs-opentelemetry';

@Span('CRITICAL_SECTION')
async getHello() {
    return 'Hello World!';
}
```
#### 📬 Tracing Service
Sometimes you need to access native span methods for special logics in the method block. At that moment, Trace Service comes to help
``` typescript
@Injectable()
export class AppService {
  constructor(private readonly traceService: TraceService) {}

  @Span()
  async getHello() {
    const currentSpan = this.traceService.getSpan(); // --> retrives current span, comes from http or @Span
    await this.doSomething();
    currentSpan.addEvent('some event');
    currentSpan.end(); // current span end
    
    const span = this.traceService.startSpan('sub_span'); // start new span
    span.setAttributes({ userId: 1 });
    await this.blueHomeland();
    span.end(); // new span ends
    return 'Hello World!';
  }
}
```
#### 🎬 Final results should look like this in Zipkin server

<img src="./docs/zipkin_screen.png"  alt="Nestjs opentelemetry zipkin result"/>
