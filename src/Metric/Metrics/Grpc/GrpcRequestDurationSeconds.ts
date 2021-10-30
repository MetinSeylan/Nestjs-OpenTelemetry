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
export class GrpcRequestDurationSeconds implements BaseMetric {
  private static metricOptions: Partial<MetricOptions> = {
    boundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    valueType: ValueType.DOUBLE,
  };

  name = 'grpc_request_duration_seconds';
  description = 'grpc_request_duration_seconds';

  private valueRecorder: ValueRecorder;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    this.valueRecorder = this.metricService
      .getProvider()
      .getMeter('default')
      .createValueRecorder(this.name, {
        ...GrpcRequestDurationSeconds.metricOptions,
        description: this.description,
      });
  }

  @OnEvent(ProducerEvent.GRPC)
  onResult(event: ProducerGrpcEvent) {
    this.valueRecorder.record(
      event.time,
      Object.assign(event.labels, this.metricService.getLabels()),
    );
  }

  public static build(metricOptions: Partial<MetricOptions>) {
    GrpcRequestDurationSeconds.metricOptions = {
      ...GrpcRequestDurationSeconds.metricOptions,
      ...metricOptions,
    };

    return GrpcRequestDurationSeconds;
  }
}
