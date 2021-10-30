import { Injector } from './Injector';
import { ModulesContainer } from '@nestjs/core';
import { BaseTraceInjector } from './BaseTraceInjector';
export declare class ScheduleInjector extends BaseTraceInjector implements Injector {
    protected readonly modulesContainer: ModulesContainer;
    private static SCHEDULE_CRON_OPTIONS;
    private static SCHEDULE_INTERVAL_OPTIONS;
    private static SCHEDULE_TIMEOUT_OPTIONS;
    private static SCHEDULER_NAME;
    private readonly loggerService;
    constructor(modulesContainer: ModulesContainer);
    inject(): void;
    private isScheduler;
    private isCron;
    private isTimeout;
    private isInterval;
    private getName;
}
