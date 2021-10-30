import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Constants } from '../../Constants';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { Controller, Injectable } from '@nestjs/common/interfaces';
import { PATH_METADATA } from '@nestjs/common/constants';

export class BaseMetricInjector {
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

  protected isAffected(prototype): boolean {
    return Reflect.hasMetadata(Constants.METRIC_METADATA_ACTIVE, prototype);
  }

  protected isDecorated(prototype): boolean {
    return Reflect.hasMetadata(Constants.METRIC_METADATA, prototype);
  }

  protected getOptions(prototype) {
    return Reflect.getMetadata(Constants.METRIC_METADATA, prototype) || {};
  }

  protected reDecorate(source, destination) {
    const keys = Reflect.getMetadataKeys(source);

    for (const key of keys) {
      const meta = Reflect.getMetadata(key, source);
      Reflect.defineMetadata(key, meta, destination);
    }
  }

  protected wrap(prototype: Record<any, any>, metric) {
    const method = {
      [prototype.name]: function (...args: any[]) {
        const startAt = new Date().getMilliseconds();
        if (prototype.constructor.name === 'AsyncFunction') {
          return prototype.apply(this, args).finally(() => {
            metric(new Date().getMilliseconds() - startAt);
          });
        } else {
          try {
            return prototype.apply(this, args);
          } finally {
            metric(new Date().getMilliseconds() - startAt);
          }
        }
      },
    }[prototype.name];

    this.reDecorate(prototype, method);
    this.affect(method);

    return method;
  }

  protected affect(prototype) {
    Reflect.defineMetadata(Constants.METRIC_METADATA_ACTIVE, 1, prototype);
  }
}
