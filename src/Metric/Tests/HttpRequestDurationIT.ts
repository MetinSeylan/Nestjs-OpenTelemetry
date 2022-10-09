import { Test } from '@nestjs/testing';
import { OpenTelemetryModule } from '../../OpenTelemetryModule';
import { Controller, Get } from '@nestjs/common';
import { HttpRequestDurationSeconds } from '../Metrics/Http/HttpRequestDurationSeconds';
import waitForExpect from 'wait-for-expect';
import * as request from 'supertest';

describe('Metric Http Test', () => {
  const exporter = jest.fn();
  const sdkModule = OpenTelemetryModule.forRoot({
    metricAutoObservers: [HttpRequestDurationSeconds],
  });

  beforeEach(() => {
    exporter.mockClear();
    exporter.mockReset();
  });

  it(`should generate http metric`, async () => {
    // given
    @Controller('hello')
    class HelloController {
      @Get()
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
      expect(exporter).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            descriptor: {
              name: 'http_request_duration_seconds',
              description: 'http_request_duration_seconds',
              unit: '1',
              metricKind: 2,
              valueType: 1,
              boundaries: [
                0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
              ],
            },
          }),
        ]),
        expect.any(Function),
      ),
    );

    await app.close();
  });
});
