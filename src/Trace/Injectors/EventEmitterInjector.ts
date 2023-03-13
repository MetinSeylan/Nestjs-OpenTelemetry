import { Injectable, Logger } from '@nestjs/common';
import { Injector } from './Injector';
import { ModulesContainer } from '@nestjs/core';
import { BaseTraceInjector } from './BaseTraceInjector';

@Injectable()
export class EventEmitterInjector
  extends BaseTraceInjector
  implements Injector
{
  private static EVENT_LISTENER_METADATA = 'EVENT_LISTENER_METADATA';

  private readonly loggerService = new Logger();

  constructor(protected readonly modulesContainer: ModulesContainer) {
    super(modulesContainer);
  }

  public inject() {
    const providers = this.getProviders();

    for (const provider of providers) {
      const keys = this.metadataScanner.getAllMethodNames(
        provider.metatype.prototype,
      );

      for (const key of keys) {
        if (
          !this.isDecorated(provider.metatype.prototype[key]) &&
          !this.isAffected(provider.metatype.prototype[key]) &&
          this.isEventConsumer(provider.metatype.prototype[key])
        ) {
          const eventName = this.getEventName(provider.metatype.prototype[key]);
          provider.metatype.prototype[key] = this.wrap(
            provider.metatype.prototype[key],
            `Event->${provider.name}.${eventName}`,
            {
              instance: provider.name,
              method: provider.metatype.prototype[key].name,
              event: eventName,
            },
          );
          this.loggerService.log(
            `Mapped ${provider.name}.${key}`,
            this.constructor.name,
          );
        }
      }
    }
  }

  private isEventConsumer(prototype): boolean {
    return Reflect.getMetadata(
      EventEmitterInjector.EVENT_LISTENER_METADATA,
      prototype,
    );
  }

  private getEventName(prototype): string {
    const metadata: Array<{ event: string }> = Reflect.getMetadata(
      EventEmitterInjector.EVENT_LISTENER_METADATA,
      prototype,
    );
    return metadata[0].event;
  }
}
