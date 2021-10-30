import { Injector } from './Injector';
import { ModulesContainer } from '@nestjs/core';
import { BaseTraceInjector } from './BaseTraceInjector';
export declare class EventEmitterInjector extends BaseTraceInjector implements Injector {
    protected readonly modulesContainer: ModulesContainer;
    private static EVENT_LISTENER_METADATA;
    private readonly loggerService;
    constructor(modulesContainer: ModulesContainer);
    inject(): void;
    private isEventConsumer;
    private getEventName;
}
