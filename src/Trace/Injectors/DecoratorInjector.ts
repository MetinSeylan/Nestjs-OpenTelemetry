import { Injectable, Logger } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { Injector } from './Injector';
import { BaseTraceInjector } from './BaseTraceInjector';

@Injectable()
export class DecoratorInjector extends BaseTraceInjector implements Injector {
  private readonly loggerService = new Logger();

  constructor(protected readonly modulesContainer: ModulesContainer) {
    super(modulesContainer);
  }

  public inject() {
    this.injectProviders();
    this.injectControllers();
  }

  private injectProviders() {
    const providers = this.getProviders();

    for (const provider of providers) {
      if (this.isDecorated(provider.metatype)) {
        throw new Error(
          `@Span decorator not used with @Injectable provider class. Class: ${provider.name}`,
        );
      }

      const keys = this.metadataScanner.getAllFilteredMethodNames(
        provider.metatype.prototype,
      );

      for (const key of keys) {
        if (
          this.isDecorated(provider.metatype.prototype[key]) &&
          !this.isAffected(provider.metatype.prototype[key])
        ) {
          provider.metatype.prototype[key] = this.wrap(
            provider.metatype.prototype[key],
            this.getPrefix(
              provider.metatype.prototype[key],
              `Provider->${provider.name}`,
            ),
          );
          this.loggerService.log(
            `Mapped ${provider.name}.${key}`,
            this.constructor.name,
          );
        }
      }
    }
  }

  private injectControllers() {
    const controllers = this.getControllers();

    for (const controller of controllers) {
      const isControllerDecorated = this.isDecorated(controller.metatype);

      const keys = this.metadataScanner.getAllFilteredMethodNames(
        controller.metatype.prototype,
      );

      for (const key of keys) {
        if (
          (isControllerDecorated &&
            !this.isAffected(controller.metatype.prototype[key])) ||
          (this.isDecorated(controller.metatype.prototype[key]) &&
            !this.isAffected(controller.metatype.prototype[key]))
        ) {
          const method = this.wrap(
            controller.metatype.prototype[key],
            this.getPrefix(
              controller.metatype.prototype[key],
              `Controller->${controller.name}`,
            ),
          );
          this.reDecorate(controller.metatype.prototype[key], method);

          controller.metatype.prototype[key] = method;
          this.loggerService.log(
            `Mapped ${controller.name}.${key}`,
            this.constructor.name,
          );
        }
      }
    }
  }

  private getPrefix(prototype, type: string) {
    const name = this.getTraceName(prototype);
    if (name) {
      return `${type}.${name}`;
    }
    return `${type}.${prototype.name}`;
  }
}
