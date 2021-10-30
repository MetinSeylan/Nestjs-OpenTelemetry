import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Span } from '@opentelemetry/api';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { Controller, Injectable } from '@nestjs/common/interfaces';
export declare class BaseTraceInjector {
    protected readonly modulesContainer: ModulesContainer;
    protected readonly metadataScanner: MetadataScanner;
    constructor(modulesContainer: ModulesContainer);
    protected getControllers(): Generator<InstanceWrapper<Controller>>;
    protected getProviders(): Generator<InstanceWrapper<Injectable>>;
    protected isPath(prototype: any): boolean;
    protected isAffected(prototype: any): boolean;
    protected getTraceName(prototype: any): string;
    protected isDecorated(prototype: any): boolean;
    protected reDecorate(source: any, destination: any): void;
    protected wrap(prototype: Record<any, any>, traceName: any, attributes?: {}): (...args: any[]) => any;
    protected static recordException(error: any, span: Span): void;
    protected affect(prototype: any): void;
}
