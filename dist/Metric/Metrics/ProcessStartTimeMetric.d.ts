import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
export declare class ProcessStartTimeMetric implements BaseMetric {
    private readonly metricService;
    name: string;
    description: string;
    private valueObserver;
    private readonly uptimeInSecond;
    constructor(metricService: MetricService);
    inject(): Promise<void>;
    private observerCallback;
}
