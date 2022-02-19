import { BaseMetric } from '../BaseMetric';
import { MetricService } from '../../MetricService';
import { MetricOptions } from '@opentelemetry/api-metrics';
import { ProducerGrpcEvent } from '../../Interceptors/Grpc/ProducerGrpcEvent';
export declare class RabbitMqRequestDurationSeconds implements BaseMetric {
    private readonly metricService;
    private static metricOptions;
    name: string;
    description: string;
    private histogram;
    constructor(metricService: MetricService);
    inject(): Promise<void>;
    onResult(event: ProducerGrpcEvent): void;
    static build(metricOptions: Partial<MetricOptions>): typeof RabbitMqRequestDurationSeconds;
}
