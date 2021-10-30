import { BaseMetric } from '../BaseMetric';
import { MetricService } from '../../MetricService';
import { Injectable } from '@nestjs/common';
import {
  MetricOptions,
  ValueRecorder,
  ValueType,
} from '@opentelemetry/api-metrics';
import { OnEvent } from '@nestjs/event-emitter';
import { ProducerEvent } from '../../Interceptors/ProducerEvent';
import { ProducerGrpcEvent } from '../../Interceptors/Grpc/ProducerGrpcEvent';

@Injectable()
export class RabbitMqRequestDurationSeconds implements BaseMetric {
  private static metricOptions: Partial<MetricOptions> = {
    boundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    valueType: ValueType.DOUBLE,
  };

  name = 'rmq_request_duration_seconds';
  description = 'rmq_request_duration_seconds';

  private valueRecorder: ValueRecorder;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    this.valueRecorder = this.metricService
      .getProvider()
      .getMeter('default')
      .createValueRecorder(this.name, {
        ...RabbitMqRequestDurationSeconds.metricOptions,
        description: this.description,
      });
  }

  @OnEvent(ProducerEvent.RMQ)
  onResult(event: ProducerGrpcEvent) {
    this.valueRecorder.record(
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
