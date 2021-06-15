import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { context, SpanStatusCode, trace } from '@opentelemetry/api';

@Catch()
export class TraceExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const span = trace.getSpan(context.active());
    if(span) {
      const spanContext = span.spanContext();

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: JSON.stringify(exception),
      });

      response.header('x-b3-traceid', spanContext.traceId);
      response.header('x-b3-spanid', spanContext.spanId);
      if (span['parentSpanId'])
        response.header('x-b3-parentspanid', span['parentSpanId']);
    }

    super.catch(exception, host);
  }
}
