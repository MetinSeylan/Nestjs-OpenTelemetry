import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Constants } from '../../Constants';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { Controller, Injectable } from '@nestjs/common/interfaces';
import { PATH_METADATA } from '@nestjs/common/constants';
import { PATTERN_HANDLER_METADATA } from '@nestjs/microservices/constants';
import { TraceWrapper } from '../TraceWrapper';

export class BaseTraceInjector {
  protected readonly metadataScanner: MetadataScanner = new MetadataScanner();

  constructor(protected readonly modulesContainer: ModulesContainer) {}

  protected *getControllers(): Generator<InstanceWrapper<Controller>> {
    for (const module of this.modulesContainer.values()) {
      for (const controller of module.controllers.values()) {
        if (controller && controller.metatype?.prototype) {
          yield controller as InstanceWrapper<Controller>;
        }
      }
    }
  }

  protected *getProviders(): Generator<InstanceWrapper<Injectable>> {
    for (const module of this.modulesContainer.values()) {
      for (const provider of module.providers.values()) {
        if (provider && provider.metatype?.prototype) {
          yield provider as InstanceWrapper<Injectable>;
        }
      }
    }
  }

  protected isPath(prototype): boolean {
    return Reflect.hasMetadata(PATH_METADATA, prototype);
  }

  protected isMicroservice(prototype): boolean {
    return Reflect.hasMetadata(PATTERN_HANDLER_METADATA, prototype);
  }

  protected isAffected(prototype): boolean {
    return Reflect.hasMetadata(Constants.TRACE_METADATA_ACTIVE, prototype);
  }

  protected getTraceName(prototype): string {
    return Reflect.getMetadata(Constants.TRACE_METADATA, prototype);
  }

  protected isDecorated(prototype): boolean {
    return Reflect.hasMetadata(Constants.TRACE_METADATA, prototype);
  }

  protected reDecorate(source, destination) {
    const keys = Reflect.getMetadataKeys(source);

    for (const key of keys) {
      const meta = Reflect.getMetadata(key, source);
      Reflect.defineMetadata(key, meta, destination);
    }
  }

  protected wrap(prototype: Record<any, any>, traceName, attributes = {}) {
    return TraceWrapper.wrap(prototype, traceName, attributes);
  }

  protected affect(prototype) {
    Reflect.defineMetadata(Constants.TRACE_METADATA_ACTIVE, 1, prototype);
  }
}
