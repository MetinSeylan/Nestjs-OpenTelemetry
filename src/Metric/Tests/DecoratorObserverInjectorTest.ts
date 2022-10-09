import { Test } from '@nestjs/testing';
import { OpenTelemetryModule } from '../../OpenTelemetryModule';
import { Injectable } from '@nestjs/common';
import waitForExpect from 'wait-for-expect';
import { Observer } from '../Decorators/Observer';

describe('Decorator Observer Injector Test', () => {
  const exporter = jest.fn();
  const sdkModule = OpenTelemetryModule.forRoot();

  beforeEach(() => {
    exporter.mockClear();
    exporter.mockReset();
  });

  it(`should observe decorated provider method`, async () => {
    // given
    @Injectable()
    class HelloService {
      @Observer()
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

    // then
    await waitForExpect(() =>
      expect(exporter).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            descriptor: {
              name: 'helloservice_hi',
              description: '',
              unit: '1',
              metricKind: 2,
              valueType: 1,
            },
          }),
        ]),
        expect.any(Function),
      ),
    );

    await app.close();
  });
});
