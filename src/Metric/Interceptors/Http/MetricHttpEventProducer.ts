import { ExecutionContext, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProducerEvent } from '../ProducerEvent';
import { Outcome } from './ProducerHttpEvent';

@Injectable()
export class MetricHttpEventProducer {
  constructor(private eventEmitter: EventEmitter2) {}

  public onFinish(context: ExecutionContext, startAt, exception?: string) {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    response.once('finish', () =>
      this.publish(request, response, startAt, exception),
    );
  }

  private publish(request, response, startAt, exception: string) {
    const diff = process.hrtime(startAt);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    this.eventEmitter.emit(ProducerEvent.HTTP, {
      time,
      labels: {
        exception,
        method: request.method,
        outcome: this.getOutcome(response),
        status: response.statusCode,
        uri: request.route.path,
      },
    });
  }

  private getOutcome(response): Outcome {
    if (response.statusCode >= 100 && response.statusCode < 200) {
      return Outcome.INFORMATIONAL;
    } else if (response.statusCode >= 200 && response.statusCode < 300) {
      return Outcome.SUCCESS;
    } else if (response.statusCode >= 300 && response.statusCode < 400) {
      return Outcome.REDIRECTION;
    } else if (response.statusCode >= 400 && response.statusCode < 500) {
      return Outcome.CLIENT_ERROR;
    } else if (response.statusCode >= 500 && response.statusCode < 600) {
      return Outcome.SERVER_ERROR;
    }
    return Outcome.UNKNOWN;
  }
}
