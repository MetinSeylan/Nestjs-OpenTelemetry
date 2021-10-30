import { ExecutionContext } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class MetricHttpEventProducer {
    private eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    onFinish(context: ExecutionContext, startAt: any, exception?: string): void;
    private publish;
    private getOutcome;
}
