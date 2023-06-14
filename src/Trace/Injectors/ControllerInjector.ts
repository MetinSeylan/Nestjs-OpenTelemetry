import { Injectable, Logger } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { BaseTraceInjector } from './BaseTraceInjector';
import { Injector } from './Injector';

@Injectable()
export class ControllerInjector extends BaseTraceInjector implements Injector {
  private readonly loggerService = new Logger();

  constructor(protected readonly modulesContainer: ModulesContainer) {
    super(modulesContainer);
  }

  public inject() {
    const controllers = this.getControllers();

    for (const controller of controllers) {
      const keys = this.metadataScanner.getAllMethodNames(
        controller.metatype.prototype,
      );

      for (const key of keys) {
        if (
          !this.isDecorated(controller.metatype.prototype[key]) &&
          !this.isAffected(controller.metatype.prototype[key]) &&
          (this.isPath(controller.metatype.prototype[key]) ||
            this.isMicroservice(controller.metatype.prototype[key]))
        ) {
          const traceName = `Controller->${controller.name}.${controller.metatype.prototype[key].name}`;
          const method = this.wrap(
            controller.metatype.prototype[key],
            traceName,
            {
              controller: controller.name,
              method: controller.metatype.prototype[key].name,
            },
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
}
