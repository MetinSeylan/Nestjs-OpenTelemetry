import { ModulesContainer } from '@nestjs/core';
import { BaseMetricInjector } from './BaseMetricInjector';
import { MetricService } from '../MetricService';
export declare class DecoratorCounterMetricInjector extends BaseMetricInjector {
    protected readonly metricService: MetricService;
    protected readonly modulesContainer: ModulesContainer;
    private readonly loggerService;
    constructor(metricService: MetricService, modulesContainer: ModulesContainer);
    inject(): Promise<void>;
    private injectProviders;
    private injectControllers;
    private generateMetric;
    private generateName;
}
