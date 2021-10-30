import { ModulesContainer } from '@nestjs/core';
import { Injector } from './Injector';
import { BaseTraceInjector } from './BaseTraceInjector';
export declare class DecoratorInjector extends BaseTraceInjector implements Injector {
    protected readonly modulesContainer: ModulesContainer;
    private readonly loggerService;
    constructor(modulesContainer: ModulesContainer);
    inject(): void;
    private injectProviders;
    private injectControllers;
    private getPrefix;
}
