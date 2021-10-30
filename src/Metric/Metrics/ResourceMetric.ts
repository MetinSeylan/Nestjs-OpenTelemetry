import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { HostMetrics } from '@opentelemetry/host-metrics';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResourceMetric implements BaseMetric {
  description = 'ResourceMetric';
  name = 'ResourceMetric';

  private hostMetrics: HostMetrics;

  constructor(private readonly metricService: MetricService) {
    this.hostMetrics = new HostMetrics({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      meterProvider: this.metricService.getProvider(),
      name: this.name,
    });
  }

  async inject(): Promise<void> {
    this.hostMetrics.start();
  }
}
