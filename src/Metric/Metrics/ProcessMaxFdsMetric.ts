import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { Injectable } from '@nestjs/common';
import { ValueObserver } from '@opentelemetry/api-metrics';
import * as fs from 'fs';

@Injectable()
export class ProcessMaxFdsMetric implements BaseMetric {
  name = 'process_max_fds';
  description = 'Maximum number of open file descriptors.';

  private valueObserver: ValueObserver;
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
    observerResult.observe(this.maxFds, this.metricService.getLabels());
  }
}
