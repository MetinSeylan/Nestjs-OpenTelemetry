import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
export declare class ResourceMetric implements BaseMetric {
    private readonly metricService;
    description: string;
    name: string;
    private hostMetrics;
    constructor(metricService: MetricService);
    inject(): Promise<void>;
}
