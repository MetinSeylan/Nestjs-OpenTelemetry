import { Injector } from './Injector';
import { ModulesContainer } from '@nestjs/core';
import { BaseTraceInjector } from './BaseTraceInjector';
export declare class PipeInjector extends BaseTraceInjector implements Injector {
    protected readonly modulesContainer: ModulesContainer;
    private readonly loggerService;
    constructor(modulesContainer: ModulesContainer);
    inject(): void;
    private injectGlobals;
    private wrapPipe;
    private getPipes;
}
