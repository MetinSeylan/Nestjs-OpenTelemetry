import { Test } from '@nestjs/testing';
import { OpenTelemetryModule } from '../../OpenTelemetryModule';
import { NoopSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { CanActivate, Controller, Get, UseGuards } from '@nestjs/common';
import * as request from 'supertest';
import { GuardInjector } from '../Injectors/GuardInjector';
import { APP_GUARD } from '@nestjs/core';
import { Span } from '../Decorators/Span';

describe('Tracing Guard Injector Test', () => {
  const exporter = new NoopSpanProcessor();
  const exporterSpy = jest.spyOn(exporter, 'onStart');

  const sdkModule = OpenTelemetryModule.forRoot({
    spanProcessor: exporter,
    traceAutoInjectors: [GuardInjector],
  });

  beforeEach(() => {
    exporterSpy.mockClear();
    exporterSpy.mockReset();
  });

  it(`should trace guarded controller`, async () => {
    // given
    class VeyselEfendi implements CanActivate {
      canActivate() {
        return true;
      }
    }

    @UseGuards(VeyselEfendi)
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
    expect(exporterSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Guard->HelloController.VeyselEfendi' }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace guarded controller method`, async () => {
    // given
    class VeyselEfendi implements CanActivate {
      canActivate() {
        return true;
      }
    }

    @Controller('hello')
    class HelloController {
      @Get()
      @UseGuards(VeyselEfendi)
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
        name: 'Guard->HelloController.hi.VeyselEfendi',
      }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace guarded and decorated controller method`, async () => {
    // given
    class VeyselEfendi implements CanActivate {
      canActivate() {
        return true;
      }
    }

    @Controller('hello')
    class HelloController {
      @Get()
      @Span('comolokko')
      @UseGuards(VeyselEfendi)
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
        name: 'Guard->HelloController.hi.VeyselEfendi',
      }),
      expect.any(Object),
    );

    await app.close();
  });

  it(`should trace global guard`, async () => {
    // given
    class VeyselEfendi implements CanActivate {
      canActivate() {
        return true;
      }
    }
    @Controller('hello')
    class HelloController {
      @Get()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hi() {}
    }
    const context = await Test.createTestingModule({
      imports: [sdkModule],
      controllers: [HelloController],
      providers: [
        {
          provide: APP_GUARD,
          useClass: VeyselEfendi,
        },
      ],
    }).compile();
    const app = context.createNestApplication();
    await app.init();

    // when
    await request(app.getHttpServer()).get('/hello').send().expect(200);

    //then
    expect(exporterSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Guard->Global->VeyselEfendi' }),
      expect.any(Object),
    );

    await app.close();
  });
});
