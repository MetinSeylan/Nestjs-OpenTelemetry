import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { Injectable } from '@nestjs/common';
import { ObservableGauge } from '@opentelemetry/api-metrics';
import * as fs from 'fs';

@Injectable()
export class ProcessOpenFdsMetric implements BaseMetric {
  name = 'process_open_fds';
  description = 'Number of open file descriptors.';

  private observableBase: ObservableGauge;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    if (process.platform !== 'linux') {
      return;
    }

    this.observableBase = this.metricService
      .getMeter()
      .createObservableGauge(this.name, {
        description: this.description,
      });
    this.observableBase.addCallback((observerResult) =>
      this.observerCallback(observerResult),
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
