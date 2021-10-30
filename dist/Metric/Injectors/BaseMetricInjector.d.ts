import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { Controller, Injectable } from '@nestjs/common/interfaces';
export declare class BaseMetricInjector {
    protected readonly modulesContainer: ModulesContainer;
    protected readonly metadataScanner: MetadataScanner;
    constructor(modulesContainer: ModulesContainer);
    protected getControllers(): Generator<InstanceWrapper<Controller>>;
    protected getProviders(): Generator<InstanceWrapper<Injectable>>;
    protected isPath(prototype: any): boolean;
    protected isAffected(prototype: any): boolean;
    protected isDecorated(prototype: any): boolean;
    protected getOptions(prototype: any): any;
    protected reDecorate(source: any, destination: any): void;
    protected wrap(prototype: Record<any, any>, metric: any): (...args: any[]) => any;
    protected affect(prototype: any): void;
}
