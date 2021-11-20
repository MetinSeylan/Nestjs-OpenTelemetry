import { Test } from '@nestjs/testing';
import { OpenTelemetryModule } from '../../OpenTelemetryModule';
import { NoopSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Injectable } from '@nestjs/common';
import { Span } from '../Decorators/Span';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { ScheduleInjector } from '../Injectors/ScheduleInjector';

describe('Tracing Scheduler Injector Test', () => {
  const exporter = new NoopSpanProcessor();
  const exporterSpy = jest.spyOn(exporter, 'onStart');

  const sdkModule = OpenTelemetryModule.forRoot({
    spanProcessor: exporter,
    traceAutoInjectors: [ScheduleInjector],
  });

  beforeEach(() => {
    exporterSpy.mockClear();
    exporterSpy.mockReset();
  });

  it(`should trace scheduled cron method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Cron('2 * * * * *')
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
      expect.objectContaining({ name: 'Scheduler->Cron->HelloService.hi' }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace scheduled and named cron method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Cron('2 * * * * *', { name: 'AKSUNGUR' })
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
      expect.objectContaining({
        name: 'Scheduler->Cron->HelloService.AKSUNGUR',
      }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should not trace already decorated cron method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Cron('2 * * * * *')
      @Span('ORUC_REIS')
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
      expect.objectContaining({ name: 'Provider->HelloService.ORUC_REIS' }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace scheduled interval method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Interval(100)
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
      expect.objectContaining({ name: 'Scheduler->Interval->HelloService.hi' }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace scheduled and named interval method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Interval('FATIH', 100)
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
      expect.objectContaining({
        name: 'Scheduler->Interval->HelloService.FATIH',
      }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace scheduled timeout method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Timeout(100)
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
      expect.objectContaining({ name: 'Scheduler->Timeout->HelloService.hi' }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace scheduled and named timeout method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Timeout('BARBAROS', 100)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }
    const context = await Test.createTestingModule({
      imports: [sdkModule],
      providers: [HelloService],
    }).compile();
    const app = context.createNestApplication();
    await app.init();
    const helloService = app.get(HelloService);

    // when
    helloService.hi();

    //then
    expect(exporterSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Scheduler->Timeout->HelloService.BARBAROS',
      }),
      expect.any(Object),
    );

    await app.close();
  });
});
