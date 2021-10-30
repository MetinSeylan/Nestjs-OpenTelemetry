import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricHttpEventProducer } from './Http/MetricHttpEventProducer';
import { MetricGrpcEventProducer } from './Grpc/MetricGrpcEventProducer';
import { MetricRabbitMQEventProducer } from './RabbitMQ/MetricRabbitMQEventProducer';
export declare class MetricInterceptor implements NestInterceptor {
    private readonly metricHttpEventProducer;
    private readonly metricGrpcEventProducer;
    private readonly metricRabbitMQEventProducer;
    constructor(metricHttpEventProducer: MetricHttpEventProducer, metricGrpcEventProducer: MetricGrpcEventProducer, metricRabbitMQEventProducer: MetricRabbitMQEventProducer);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private getFinalPipe;
    private calculate;
    private getStartAt;
    private getProtocol;
    private getRpcTransportProtocol;
    private getException;
}
