import { Test } from '@nestjs/testing';
import { OpenTelemetryModule } from '../../OpenTelemetryModule';
import { NoopSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Controller, Get, Injectable } from '@nestjs/common';
import { Span } from '../Decorators/Span';
import * as request from 'supertest';
import { Constants } from '../../Constants';

describe('Tracing Decorator Injector Test', () => {
  const exporter = new NoopSpanProcessor();
  const exporterSpy = jest.spyOn(exporter, 'onStart');

  const sdkModule = OpenTelemetryModule.forRoot({
    spanProcessor: exporter,
  });

  beforeEach(() => {
    exporterSpy.mockClear();
    exporterSpy.mockReset();
  });

  it(`should trace decorated provider method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Span()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }
    const context = await Test.createTestingModule({
      imports: [sdkModule],
      providers: [HelloService],
    }).compile();
    const app = context.createNestApplication();
    const helloService = app.get(HelloService);

    // when
    helloService.hi();

    //then
    expect(exporterSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Provider->HelloService.hi' }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace decorated controller method`, async () => {
    // given
    @Controller('hello')
    class HelloController {
      @Span()
      @Get()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }
    const context = await Test.createTestingModule({
      imports: [sdkModule],
      controllers: [HelloController],
    }).compile();
    const app = context.createNestApplication();
    await app.init();

    // when
    await request(app.getHttpServer()).get('/hello').send().expect(200);

    //then
    expect(exporterSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Controller->HelloController.hi' }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should throw exception when Injectable and Span used same time`, async () => {
    // given
    @Span()
    @Injectable()
    class HelloService {}
    const context = await Test.createTestingModule({
      imports: [sdkModule],
      providers: [HelloService],
    });

    // when
    await expect(context.compile()).rejects.toThrow(
      `@Span decorator not used with @Injectable provider class. Class: HelloService`,
    );
  });

  it(`should trace decorated controller method with custom trace name`, async () => {
    // given
    @Controller('hello')
    class HelloController {
      @Span('MAVI_VATAN')
      @Get()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }
    const context = await Test.createTestingModule({
      imports: [sdkModule],
      controllers: [HelloController],
    }).compile();
    const app = context.createNestApplication();
    await app.init();

    // when
    await request(app.getHttpServer()).get('/hello').send().expect(200);

    //then
    expect(exporterSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Controller->HelloController.MAVI_VATAN',
      }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should not trace already tracing prototype`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Span()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }
    Reflect.defineMetadata(
      Constants.TRACE_METADATA_ACTIVE,
      1,
      HelloService.prototype.hi,
    );

    const context = await Test.createTestingModule({
      imports: [sdkModule],
      providers: [HelloService],
    }).compile();
    const app = context.createNestApplication();
    const helloService = app.get(HelloService);

    // when
    helloService.hi();

    //then
    expect(exporterSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Provider->HelloService.hi' }),
      expect.any(Object),
    );

    await app.close();
  });
});
