import { BaseMetric } from '../BaseMetric';
import { MetricService } from '../../MetricService';
import { ProducerHttpEvent } from '../../Interceptors/Http/ProducerHttpEvent';
import { MetricOptions } from '@opentelemetry/api-metrics';
export declare class HttpRequestDurationSeconds implements BaseMetric {
    private readonly metricService;
    private static metricOptions;
    name: string;
    description: string;
    private histogram;
    constructor(metricService: MetricService);
    inject(): Promise<void>;
    onResult(event: ProducerHttpEvent): void;
    static build(metricOptions: Partial<MetricOptions>): typeof HttpRequestDurationSeconds;
}
