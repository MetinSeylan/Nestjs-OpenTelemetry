import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { Injectable } from '@nestjs/common';
import { ObservableGauge } from '@opentelemetry/api-metrics';

@Injectable()
export class ActiveHandlesTotalMetric implements BaseMetric {
  name = 'nodejs_active_handles_total';
  description = 'Total number of active handles.';

  private observableBase: ObservableGauge;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    if (typeof process['_getActiveHandles'] !== 'function') {
      return;
    }

    this.observableBase = this.metricService
      .getProvider()
      .getMeter('default')
      .createObservableGauge(
        this.name,
        {
          description: this.description,
        },
        (observerResult) => this.observerCallback(observerResult),
      );
  }

  private observerCallback(observerResult) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const handles = process._getActiveHandles();
    observerResult.observe(handles.length, this.metricService.getLabels());
  }
}
