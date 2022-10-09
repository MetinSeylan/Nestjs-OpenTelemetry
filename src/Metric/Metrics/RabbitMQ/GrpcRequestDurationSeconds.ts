import { BaseMetric } from '../BaseMetric';
import { MetricService } from '../../MetricService';
import { Injectable } from '@nestjs/common';
import {
  MetricOptions,
  Histogram,
  ValueType,
} from '@opentelemetry/api-metrics';
import { OnEvent } from '@nestjs/event-emitter';
import { ProducerEvent } from '../../Interceptors/ProducerEvent';
import { ProducerGrpcEvent } from '../../Interceptors/Grpc/ProducerGrpcEvent';

@Injectable()
export class RabbitMqRequestDurationSeconds implements BaseMetric {
  private static metricOptions: Partial<MetricOptions> = {
    valueType: ValueType.DOUBLE,
  };

  name = 'rmq_request_duration_seconds';
  description = 'rmq_request_duration_seconds';

  private histogram: Histogram;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    this.histogram = this.metricService.getMeter().createHistogram(this.name, {
      ...RabbitMqRequestDurationSeconds.metricOptions,
      description: this.description,
    });
  }

  @OnEvent(ProducerEvent.RMQ)
  onResult(event: ProducerGrpcEvent) {
    this.histogram.record(
      event.time,
      Object.assign(event.labels, this.metricService.getLabels()),
    );
  }

  public static build(metricOptions: Partial<MetricOptions>) {
    RabbitMqRequestDurationSeconds.metricOptions = {
      ...RabbitMqRequestDurationSeconds.metricOptions,
      ...metricOptions,
    };

    return RabbitMqRequestDurationSeconds;
  }
}
