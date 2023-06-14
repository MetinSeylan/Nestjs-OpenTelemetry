import { Injectable, Logger } from '@nestjs/common';
import { Injector } from './Injector';
import { ModulesContainer } from '@nestjs/core';
import { BaseTraceInjector } from './BaseTraceInjector';

@Injectable()
export class ScheduleInjector extends BaseTraceInjector implements Injector {
  private static SCHEDULE_CRON_OPTIONS = 'SCHEDULE_CRON_OPTIONS';
  private static SCHEDULE_INTERVAL_OPTIONS = 'SCHEDULE_INTERVAL_OPTIONS';
  private static SCHEDULE_TIMEOUT_OPTIONS = 'SCHEDULE_TIMEOUT_OPTIONS';
  private static SCHEDULER_NAME = 'SCHEDULER_NAME';

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
          this.isScheduler(provider.metatype.prototype[key])
        ) {
          const name = this.getName(provider, provider.metatype.prototype[key]);
          provider.metatype.prototype[key] = this.wrap(
            provider.metatype.prototype[key],
            name,
          );
          this.loggerService.log(`Mapped ${name}`, this.constructor.name);
        }
      }
    }
  }

  private isScheduler(prototype): boolean {
    return (
      this.isCron(prototype) ||
      this.isTimeout(prototype) ||
      this.isInterval(prototype)
    );
  }

  private isCron(prototype): boolean {
    return Reflect.hasMetadata(
      ScheduleInjector.SCHEDULE_CRON_OPTIONS,
      prototype,
    );
  }

  private isTimeout(prototype): boolean {
    return Reflect.hasMetadata(
      ScheduleInjector.SCHEDULE_TIMEOUT_OPTIONS,
      prototype,
    );
  }

  private isInterval(prototype): boolean {
    return Reflect.hasMetadata(
      ScheduleInjector.SCHEDULE_INTERVAL_OPTIONS,
      prototype,
    );
  }

  private getName(provider, prototype): string {
    if (this.isCron(prototype)) {
      const options = Reflect.getMetadata(
        ScheduleInjector.SCHEDULE_CRON_OPTIONS,
        prototype,
      );
      if (options && options.name) {
        return `Scheduler->Cron->${provider.name}.${options.name}`;
      }
      return `Scheduler->Cron->${provider.name}.${prototype.name}`;
    }

    if (this.isTimeout(prototype)) {
      const name = Reflect.getMetadata(
        ScheduleInjector.SCHEDULER_NAME,
        prototype,
      );
      if (name) {
        return `Scheduler->Timeout->${provider.name}.${name}`;
      }
      return `Scheduler->Timeout->${provider.name}.${prototype.name}`;
    }

    if (this.isInterval(prototype)) {
      const name = Reflect.getMetadata(
        ScheduleInjector.SCHEDULER_NAME,
        prototype,
      );
      if (name) {
        return `Scheduler->Interval->${provider.name}.${name}`;
      }
      return `Scheduler->Interval->${provider.name}.${prototype.name}`;
    }
  }
}
