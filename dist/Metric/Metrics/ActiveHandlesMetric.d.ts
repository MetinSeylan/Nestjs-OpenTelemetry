import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
export declare class ActiveHandlesMetric implements BaseMetric {
    private readonly metricService;
    name: string;
    description: string;
    private valueObserver;
    constructor(metricService: MetricService);
    inject(): Promise<void>;
    private observerCallback;
    private aggregateByObjectName;
}
