import {
  CallHandler,
  ContextType,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InterceptorProtocol } from './InterceptorProtocol';
import { MetricHttpEventProducer } from './Http/MetricHttpEventProducer';
import { RmqContext, Transport } from '@nestjs/microservices';
import { TRANSPORT_METADATA } from '@nestjs/microservices/constants';
import { MetricGrpcEventProducer } from './Grpc/MetricGrpcEventProducer';
import { Exception } from '@opentelemetry/api';
import { MetricRabbitMQEventProducer } from './RabbitMQ/MetricRabbitMQEventProducer';

@Injectable()
export class MetricInterceptor implements NestInterceptor {
  constructor(
    private readonly metricHttpEventProducer: MetricHttpEventProducer,
    private readonly metricGrpcEventProducer: MetricGrpcEventProducer,
    private readonly metricRabbitMQEventProducer: MetricRabbitMQEventProducer,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const protocol = this.getProtocol(context);
    const startAt = this.getStartAt(context, protocol);

    return next.handle().pipe(this.getFinalPipe(context, protocol, startAt));
  }

  private getFinalPipe(
    context: ExecutionContext,
    protocol: InterceptorProtocol,
    startAt,
  ) {
    return tap(
      () => this.calculate(context, protocol, startAt),
      (error) => this.calculate(context, protocol, startAt, error),
    );
  }

  private calculate(
    context: ExecutionContext,
    protocol: InterceptorProtocol,
    startAt,
    error?,
  ) {
    const exception = this.getException(error);

    if (protocol === InterceptorProtocol.HTTP) {
      this.metricHttpEventProducer.onFinish(context, startAt, exception);
    } else if (protocol === InterceptorProtocol.RPC) {
      const transport = this.getRpcTransportProtocol(context);
      if (transport === Transport.GRPC) {
        this.metricGrpcEventProducer.onFinish(context, startAt, exception);
      } else if (transport === Transport.RMQ) {
        this.metricRabbitMQEventProducer.onFinish(context, startAt, exception);
      }
    }
  }

  private getStartAt(context: ExecutionContext, protocol: InterceptorProtocol) {
    if (protocol === InterceptorProtocol.HTTP) {
      const request = context.switchToHttp().getRequest();
      return request.startAt;
    }
    return process.hrtime();
  }

  private getProtocol(context: ExecutionContext): InterceptorProtocol {
    switch (context.getType<ContextType | 'graphql'>()) {
      case 'http':
        return InterceptorProtocol.HTTP;
      case 'rpc':
        return InterceptorProtocol.RPC;
      case 'ws':
        return InterceptorProtocol.WS;
      case 'graphql':
        return InterceptorProtocol.GQL;
    }
  }

  private getRpcTransportProtocol(context: ExecutionContext): Transport {
    const defined = Reflect.getMetadata(
      TRANSPORT_METADATA,
      context.getHandler(),
    );
    if (defined) return defined;

    if (context.getArgByIndex(1) instanceof RmqContext) {
      return Transport.RMQ;
    }
  }

  private getException(exception: Error | HttpException | Exception) {
    if (!exception) return '';

    if (exception.constructor?.name) {
      return exception.constructor.name;
    } else if (exception['name']) {
      return exception['name'];
    } else if (exception['code']) {
      return exception['code'];
    } else if (exception['message']) {
      return exception['message'];
    }
    return 'UNKNOWN';
  }
}
