import { Injectable, Logger } from '@nestjs/common';
import { MetricOptions } from '@opentelemetry/api-metrics';
import { ModulesContainer } from '@nestjs/core';
import { BaseMetricInjector } from './BaseMetricInjector';
import { MetricService } from '../MetricService';
import { DecoratorType } from '../Decorators/DecoratorType';

@Injectable()
export class DecoratorCounterMetricInjector extends BaseMetricInjector {
  private readonly loggerService = new Logger();

  constructor(
    protected readonly metricService: MetricService,
    protected readonly modulesContainer: ModulesContainer,
  ) {
    super(modulesContainer);
  }

  async inject(): Promise<void> {
    this.injectProviders();
    this.injectControllers();
  }

  private injectProviders() {
    const providers = this.getProviders();

    for (const provider of providers) {
      if (this.isDecorated(provider.metatype)) {
        throw new Error(
          `@Counter decorator not used with @Injectable provider class. Class: ${provider.name}`,
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
          const options = this.getOptions(provider.metatype.prototype[key]);
          if (options.type !== DecoratorType.COUNTER) return;

          const name =
            options['name']?.toLowerCase() ??
            this.generateName(provider, provider.metatype.prototype[key]);
          const metric = this.generateMetric(name, options['options']);
          provider.metatype.prototype[key] = this.wrap(
            provider.metatype.prototype[key],
            metric,
          );
          this.loggerService.log(`Mapped ${name}`, this.constructor.name);
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
        const prototype = controller.metatype.prototype[key];
        if (
          ((isControllerDecorated && !this.isAffected(prototype)) ||
            (this.isDecorated(prototype) && !this.isAffected(prototype))) &&
          this.isPath(prototype)
        ) {
          const options = this.getOptions(
            isControllerDecorated ? controller.metatype : prototype,
          );
          if (options.type !== DecoratorType.COUNTER) return;

          const name = this.generateName(controller, prototype, options);
          const metric = this.generateMetric(name, options['options']);

          controller.metatype.prototype[key] = this.wrap(prototype, metric);
          this.loggerService.log(`Mapped ${name}`, this.constructor.name);
        }
      }
    }
  }

  private generateMetric(name: string, metricOptions: MetricOptions) {
    const metric = this.metricService
      .getMeter()
      .createCounter(name, metricOptions);

    return () => {
      metric.add(1, this.metricService.getLabels());
    };
  }

  private generateName(provider, prototype, options?) {
    return `${options?.name ?? provider.name}_${prototype.name}`.toLowerCase();
  }
}
