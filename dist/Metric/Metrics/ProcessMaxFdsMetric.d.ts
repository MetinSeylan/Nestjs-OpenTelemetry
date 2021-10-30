import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
export declare class ProcessMaxFdsMetric implements BaseMetric {
    private readonly metricService;
    name: string;
    description: string;
    private valueObserver;
    private maxFds;
    constructor(metricService: MetricService);
    inject(): Promise<void>;
    private observerCallback;
}
