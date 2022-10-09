import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { Injectable } from '@nestjs/common';
import { ObservableGauge } from '@opentelemetry/api-metrics';
import * as fs from 'fs';

@Injectable()
export class ProcessMaxFdsMetric implements BaseMetric {
  name = 'process_max_fds';
  description = 'Maximum number of open file descriptors.';

  private observableBase: ObservableGauge;
  private maxFds;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    if (this.maxFds === undefined) {
      try {
        const limits = fs.readFileSync('/proc/self/limits', 'utf8');
        const lines = limits.split('\n');
        for (const line of lines) {
          if (line.startsWith('Max open files')) {
            const parts = line.split(/  +/);
            this.maxFds = Number(parts[1]);
            break;
          }
        }
      } catch (e) {
        return;
      }
    }

    if (this.maxFds === undefined) return;

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
    observerResult.observe(this.maxFds, this.metricService.getLabels());
  }
}
