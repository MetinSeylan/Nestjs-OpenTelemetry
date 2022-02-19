import { BaseMetric } from '../BaseMetric';
import { MetricService } from '../../MetricService';
import { Injectable } from '@nestjs/common';
import { Histogram, ValueType } from '@opentelemetry/api-metrics';
import { OnEvent } from '@nestjs/event-emitter';
import { ProducerEvent } from '../../Interceptors/ProducerEvent';
import { ProducerHttpEvent } from '../../Interceptors/Http/ProducerHttpEvent';
import { MetricOptions } from '@opentelemetry/api-metrics';

@Injectable()
export class HttpRequestDurationSeconds implements BaseMetric {
  private static metricOptions: Partial<MetricOptions> = {
    boundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    valueType: ValueType.DOUBLE,
  };

  name = 'http_request_duration_seconds';
  description = 'http_request_duration_seconds';

  private histogram: Histogram;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    this.histogram = this.metricService
      .getProvider()
      .getMeter('default')
      .createHistogram(this.name, {
        ...HttpRequestDurationSeconds.metricOptions,
        description: this.description,
      });
  }

  @OnEvent(ProducerEvent.HTTP)
  onResult(event: ProducerHttpEvent) {
    this.histogram.record(
      event.time,
      Object.assign(event.labels, this.metricService.getLabels()),
    );
  }

  public static build(metricOptions: Partial<MetricOptions>) {
    HttpRequestDurationSeconds.metricOptions = {
      ...HttpRequestDurationSeconds.metricOptions,
      ...metricOptions,
    };

    return HttpRequestDurationSeconds;
  }
}
