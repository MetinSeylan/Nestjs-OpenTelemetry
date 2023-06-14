/* eslint-disable no-console */
import { trace } from '@opentelemetry/api';
import { TraceWrapper } from './TraceWrapper';
import { ILogger } from './ILogger';

import 'reflect-metadata';

jest.mock('@opentelemetry/api');

export const MockedLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

class TestClass {
  testMethod(): void {
    console.log('test');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async testMethodAsync(
    startMessage: string,
    endMessage: string,
  ): Promise<void> {
    console.log(startMessage);
    await this.sleep(10);
    console.log(endMessage);
  }
}

describe('TraceWrapper', () => {
  let traceSpy: jest.SpyInstance;
  let mockedSpanStart: jest.Mock;
  let mockedSpanEnd: jest.Mock;
  let mockedSpanSetAtteributes: jest.Mock;
  const spanEndedMessage = 'span ended';

  beforeEach(() => {
    jest.clearAllMocks();

    traceSpy = jest.spyOn(trace, 'getTracer');
    mockedSpanEnd = jest.fn().mockImplementation(() => {
      console.log(spanEndedMessage);
    });

    mockedSpanSetAtteributes = jest.fn();
    mockedSpanStart = jest.fn().mockReturnValue({
      end: mockedSpanEnd,
      setAttributes: mockedSpanSetAtteributes,
    });
    traceSpy.mockReturnValue({
      startActiveSpan: mockedSpanStart,
    });
  });

  it('should trace all methods for a given instance', async () => {
    const target = TraceWrapper.trace(new TestClass(), MockedLogger);

    target.testMethod();
    await target.testMethodAsync('start', 'end');

    expect(mockedSpanStart).toHaveBeenCalledTimes(2);
    expect(mockedSpanStart).toHaveBeenNthCalledWith(
      1,
      'TestClass.testMethod',
      expect.anything(),
    );
    expect(mockedSpanStart).toHaveBeenNthCalledWith(
      2,
      'TestClass.testMethodAsync',
      expect.anything(),
    );
  });
});
