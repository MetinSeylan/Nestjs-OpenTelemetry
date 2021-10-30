import { Injectable, Logger, PipeTransform } from '@nestjs/common';
import { Injector } from './Injector';
import { APP_PIPE, ModulesContainer } from '@nestjs/core';
import { BaseTraceInjector } from './BaseTraceInjector';
import { PIPES_METADATA } from '@nestjs/common/constants';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

@Injectable()
export class PipeInjector extends BaseTraceInjector implements Injector {
  private readonly loggerService = new Logger();

  constructor(protected readonly modulesContainer: ModulesContainer) {
    super(modulesContainer);
  }

  public inject() {
    const controllers = this.getControllers();

    for (const controller of controllers) {
      const keys = this.metadataScanner.getAllFilteredMethodNames(
        controller.metatype.prototype,
      );

      for (const key of keys) {
        if (this.isPath(controller.metatype.prototype[key])) {
          const pipes = this.getPipes(controller.metatype.prototype[key]).map(
            (pipe) =>
              this.wrapPipe(
                pipe,
                controller,
                controller.metatype.prototype[key],
              ),
          );

          if (pipes.length > 0) {
            Reflect.defineMetadata(
              PIPES_METADATA,
              pipes,
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
        provider.token.includes(APP_PIPE) &&
        !this.isAffected(provider.metatype.prototype.transform)
      ) {
        const traceName = `Pipe->Global->${provider.metatype.name}`;
        provider.metatype.prototype.transform = this.wrap(
          provider.metatype.prototype.transform,
          traceName,
          {
            pipe: provider.metatype.name,
            scope: 'GLOBAL',
          },
        );
        this.loggerService.log(`Mapped ${traceName}`, this.constructor.name);
      }
    }
  }

  private wrapPipe(
    pipe: PipeTransform,
    controller: InstanceWrapper,
    prototype,
  ): PipeTransform {
    const pipeProto = pipe['prototype'] ?? pipe;
    if (this.isAffected(pipeProto.transform)) return pipe;

    const traceName = `Pipe->${controller.name}.${prototype.name}.${pipeProto.constructor.name}`;
    pipeProto.transform = this.wrap(pipeProto.transform, traceName, {
      controller: controller.name,
      method: prototype.name,
      pipe: pipeProto.constructor.name,
      scope: 'METHOD',
    });
    this.loggerService.log(`Mapped ${traceName}`, this.constructor.name);
    return pipeProto;
  }

  private getPipes(prototype): PipeTransform[] {
    return Reflect.getMetadata(PIPES_METADATA, prototype) || [];
  }
}
