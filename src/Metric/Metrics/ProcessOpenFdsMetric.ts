import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { Injectable } from '@nestjs/common';
import { ValueObserver } from '@opentelemetry/api-metrics';
import * as fs from 'fs';

@Injectable()
export class ProcessOpenFdsMetric implements BaseMetric {
  name = 'process_open_fds';
  description = 'Number of open file descriptors.';

  private valueObserver: ValueObserver;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    if (process.platform !== 'linux') {
      return;
    }

    this.valueObserver = this.metricService
      .getProvider()
      .getMeter('default')
      .createValueObserver(
        this.name,
        {
          description: this.description,
        },
        (observerResult) => this.observerCallback(observerResult),
      );
  }

  private observerCallback(observerResult) {
    try {
      const fds = fs.readdirSync('/dev/fd/');
      observerResult.observe(fds.length - 1, this.metricService.getLabels());
    } catch {
      // noop
    }
  }
}
