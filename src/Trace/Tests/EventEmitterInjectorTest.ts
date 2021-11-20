import { Test } from '@nestjs/testing';
import { OpenTelemetryModule } from '../../OpenTelemetryModule';
import { NoopSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Injectable } from '@nestjs/common';
import { Span } from '../Decorators/Span';
import { EventEmitterInjector } from '../Injectors/EventEmitterInjector';
import { OnEvent } from '@nestjs/event-emitter';

describe('Tracing Event Emitter Injector Test', () => {
  const exporter = new NoopSpanProcessor();
  const exporterSpy = jest.spyOn(exporter, 'onStart');

  const sdkModule = OpenTelemetryModule.forRoot({
    spanProcessor: exporter,
    traceAutoInjectors: [EventEmitterInjector],
  });

  beforeEach(() => {
    exporterSpy.mockClear();
    exporterSpy.mockReset();
  });

  it(`should trace event consumer method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @OnEvent('selam')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }
    const context = await Test.createTestingModule({
      imports: [sdkModule],
      providers: [HelloService],
    }).compile();
    const app = context.createNestApplication();
    const helloService = app.get(HelloService);
    await app.init();

    // when
    helloService.hi();

    //then
    expect(exporterSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Event->HelloService.selam' }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should not trace already decorated event consumer method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Span('untraceable')
      @OnEvent('tb2')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }
    const context = await Test.createTestingModule({
      imports: [sdkModule],
      providers: [HelloService],
    }).compile();
    const app = context.createNestApplication();
    const helloService = app.get(HelloService);
    await app.init();

    // when
    helloService.hi();

    //then
    expect(exporterSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Provider->HelloService.untraceable' }),
      expect.any(Object),
    );

    await app.close();
  });
});
