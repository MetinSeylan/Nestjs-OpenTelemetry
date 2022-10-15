import { Test } from '@nestjs/testing';
import { OpenTelemetryModule } from '../../OpenTelemetryModule';
import { NoopSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { Span } from '../Decorators/Span';
import * as request from 'supertest';
import { ControllerInjector } from '../Injectors/ControllerInjector';
import waitForExpect from 'wait-for-expect';

describe('Tracing Controller Injector Test', () => {
  const exporter = new NoopSpanProcessor();
  const exporterSpy = jest.spyOn(exporter, 'onStart');

  const sdkModule = OpenTelemetryModule.forRoot({
    spanProcessor: exporter,
    traceAutoInjectors: [ControllerInjector],
  });

  beforeEach(() => {
    exporterSpy.mockClear();
    exporterSpy.mockReset();
  });

  it(`should trace controller method`, async () => {
    // given
    @Controller('hello')
    class HelloController {
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
    await waitForExpect(() =>
      expect(exporterSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Controller->HelloController.hi' }),
        expect.any(Object),
      ),
    );

    await app.close();
  });

  it(`should trace controller method exception`, async () => {
    // given
    @Controller('hello')
    class HelloController {
      @Get()
      hi() {
        throw new ForbiddenException();
      }
    }

    const context = await Test.createTestingModule({
      imports: [sdkModule],
      controllers: [HelloController],
    }).compile();
    const app = context.createNestApplication();
    await app.init();

    // when
    await request(app.getHttpServer()).get('/hello').send().expect(403);

    //then
    await waitForExpect(() =>
      expect(exporterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Controller->HelloController.hi',
          status: {
            code: 2,
            message: 'Forbidden',
          },
        }),
        expect.any(Object),
      ),
    );

    await app.close();
  });

  it(`should not trace controller method if there is no path`, async () => {
    // given
    @Controller('hello')
    class HelloController {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }

    const context = await Test.createTestingModule({
      imports: [sdkModule],
      controllers: [HelloController],
    }).compile();
    const app = context.createNestApplication();
    await app.init();
    const helloController = app.get(HelloController);

    //when
    helloController.hi();

    //then
    await waitForExpect(() =>
      expect(exporterSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Controller->HelloController.hi' }),
        expect.any(Object),
      ),
    );

    await app.close();
  });

  it(`should not trace controller method if already decorated`, async () => {
    // given
    @Controller('hello')
    class HelloController {
      @Get()
      @Span('SLM_CNM')
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

    // then
    await waitForExpect(() =>
      expect(exporterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Controller->HelloController.SLM_CNM',
        }),
        expect.any(Object),
      ),
    );

    await app.close();
  });
});
