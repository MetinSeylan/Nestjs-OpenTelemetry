import { CanActivate, Injectable, Logger } from '@nestjs/common';
import { Injector } from './Injector';
import { APP_GUARD, ModulesContainer } from '@nestjs/core';
import { BaseTraceInjector } from './BaseTraceInjector';
import { GUARDS_METADATA } from '@nestjs/common/constants';

@Injectable()
export class GuardInjector extends BaseTraceInjector implements Injector {
  private readonly loggerService = new Logger();

  constructor(protected readonly modulesContainer: ModulesContainer) {
    super(modulesContainer);
  }

  public inject() {
    const controllers = this.getControllers();

    for (const controller of controllers) {
      if (this.isGuarded(controller.metatype)) {
        const guards = this.getGuards(controller.metatype).map((guard) => {
          const prototype = guard['prototype'] ?? guard;
          const traceName = `Guard->${controller.name}.${prototype.constructor.name}`;
          prototype.canActivate = this.wrap(prototype.canActivate, traceName, {
            controller: controller.name,
            guard: prototype.constructor.name,
            scope: 'CONTROLLER',
          });
          Object.assign(prototype, this);
          this.loggerService.log(`Mapped ${traceName}`, this.constructor.name);
          return guard;
        });

        if (guards.length > 0) {
          Reflect.defineMetadata(GUARDS_METADATA, guards, controller.metatype);
        }
      }

      const keys = this.metadataScanner.getAllMethodNames(
        controller.metatype.prototype,
      );

      for (const key of keys) {
        if (this.isGuarded(controller.metatype.prototype[key])) {
          const guards = this.getGuards(controller.metatype.prototype[key]).map(
            (guard) => {
              const prototype = guard['prototype'] ?? guard;
              const traceName = `Guard->${controller.name}.${controller.metatype.prototype[key].name}.${prototype.constructor.name}`;
              prototype.canActivate = this.wrap(
                prototype.canActivate,
                traceName,
                {
                  controller: controller.name,
                  guard: prototype.constructor.name,
                  method: controller.metatype.prototype[key].name,
                  scope: 'CONTROLLER_METHOD',
                },
              );
              Object.assign(prototype, this);
              this.loggerService.log(
                `Mapped ${traceName}`,
                this.constructor.name,
              );
              return guard;
            },
          );

          if (guards.length > 0) {
            Reflect.defineMetadata(
              GUARDS_METADATA,
              guards,
              controller.metatype.prototype[key],
            );
          }
        }
      }
    }

    this.injectGlobals();
  }

  private injectGlobals() {
    const providers = this.getProviders();

    for (const provider of providers) {
      if (
        typeof provider.token === 'string' &&
        provider.token.includes(APP_GUARD) &&
        !this.isAffected(provider.metatype.prototype.canActivate)
      ) {
        const traceName = `Guard->Global->${provider.metatype.name}`;
        provider.metatype.prototype.canActivate = this.wrap(
          provider.metatype.prototype.canActivate,
          traceName,
          {
            guard: provider.metatype.name,
            scope: 'GLOBAL',
          },
        );
        Object.assign(provider.metatype.prototype, this);
        this.loggerService.log(`Mapped ${traceName}`, this.constructor.name);
      }
    }
  }

  private getGuards(prototype): CanActivate[] {
    return Reflect.getMetadata(GUARDS_METADATA, prototype) || [];
  }

  private isGuarded(prototype): boolean {
    return Reflect.hasMetadata(GUARDS_METADATA, prototype);
  }
}
