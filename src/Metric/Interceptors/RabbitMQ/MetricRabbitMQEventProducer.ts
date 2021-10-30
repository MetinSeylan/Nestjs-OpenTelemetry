import { ExecutionContext, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProducerEvent } from '../ProducerEvent';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';

@Injectable()
export class MetricRabbitMQEventProducer {
  constructor(private eventEmitter: EventEmitter2) {}

  public onFinish(context: ExecutionContext, startAt, exception?: string) {
    const labels = this.getLabels(context);
    this.publish(startAt, exception, labels);
  }

  private publish(startAt, exception: string, labels) {
    const diff = process.hrtime(startAt);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    this.eventEmitter.emit(ProducerEvent.RMQ, {
      time,
      labels: {
        exception,
        ...labels,
      },
    });
  }

  private getLabels(context: ExecutionContext) {
    const pattern =
      Reflect.getMetadata(PATTERN_METADATA, context.getHandler()) || '';
    const tags = context.getArgByIndex(1).args[0].fields;
    return {
      pattern,
      redelivered: tags.redelivered,
      exchange: tags.exchange,
      routingKey: tags.routingKey,
    };
  }
}
