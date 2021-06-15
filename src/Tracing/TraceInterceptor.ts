import { context, trace } from '@opentelemetry/api';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  async intercept(executionContext: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const req = executionContext.switchToHttp().getRequest();
        const span = trace.getSpan(context.active());
        if(span) {
            const spanContext = span.spanContext();

            req.res.header('x-b3-traceid', spanContext.traceId);
            req.res.header('x-b3-spanid', spanContext.spanId);
            if (span['parentSpanId'])
                req.res.header('x-b3-parentspanid', span['parentSpanId']);
        }

        return data;
      }),
    );
  }
}
