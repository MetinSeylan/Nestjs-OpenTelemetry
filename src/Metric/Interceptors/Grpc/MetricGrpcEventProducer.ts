import { ExecutionContext, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProducerEvent } from '../ProducerEvent';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';

@Injectable()
export class MetricGrpcEventProducer {
  constructor(private eventEmitter: EventEmitter2) {}

  public onFinish(context: ExecutionContext, startAt, exception?: string) {
    const labels = this.getLabels(context);
    if (labels.streaming !== 'no_stream') return;

    const grpcStream = context.getArgByIndex(2).call.stream;
    grpcStream.once('close', () =>
      this.publish(startAt, exception, grpcStream, labels),
    );
  }

  private publish(startAt, exception: string, grpcStream, labels) {
    const diff = process.hrtime(startAt);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    this.eventEmitter.emit(ProducerEvent.GRPC, {
      time,
      labels: {
        exception,
        status: grpcStream.sentTrailers['grpc-status'],
        ...labels,
      },
    });
  }

  private getLabels(context: ExecutionContext) {
    return Reflect.getMetadata(PATTERN_METADATA, context.getHandler()) || {};
  }
}
