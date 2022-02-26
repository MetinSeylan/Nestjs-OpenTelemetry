"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecoratorObserverMetricInjector = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const BaseMetricInjector_1 = require("./BaseMetricInjector");
const MetricService_1 = require("../MetricService");
const DecoratorType_1 = require("../Decorators/DecoratorType");
let DecoratorObserverMetricInjector = class DecoratorObserverMetricInjector extends BaseMetricInjector_1.BaseMetricInjector {
    metricService;
    modulesContainer;
    loggerService = new common_1.Logger();
    constructor(metricService, modulesContainer) {
        super(modulesContainer);
        this.metricService = metricService;
        this.modulesContainer = modulesContainer;
    }
    async inject() {
        this.injectProviders();
        this.injectControllers();
    }
    injectProviders() {
        const providers = this.getProviders();
        for (const provider of providers) {
            if (this.isDecorated(provider.metatype)) {
                throw new Error(`@Observer decorator not used with @Injectable provider class. Class: ${provider.name}`);
            }
            const keys = this.metadataScanner.getAllFilteredMethodNames(provider.metatype.prototype);
            for (const key of keys) {
                if (this.isDecorated(provider.metatype.prototype[key]) &&
                    !this.isAffected(provider.metatype.prototype[key])) {
                    const options = this.getOptions(provider.metatype.prototype[key]);
                    if (options.type !== DecoratorType_1.DecoratorType.OBSERVER)
                        return;
                    const name = options['name']?.toLowerCase() ??
                        this.generateName(provider, provider.metatype.prototype[key]);
                    const metric = this.generateMetric(name, options['options']);
                    provider.metatype.prototype[key] = this.wrap(provider.metatype.prototype[key], metric);
                    this.loggerService.log(`Mapped ${name}`, this.constructor.name);
                }
            }
        }
    }
    injectControllers() {
        const controllers = this.getControllers();
        for (const controller of controllers) {
            const isControllerDecorated = this.isDecorated(controller.metatype);
            const keys = this.metadataScanner.getAllFilteredMethodNames(controller.metatype.prototype);
            for (const key of keys) {
                const prototype = controller.metatype.prototype[key];
                if (((isControllerDecorated && !this.isAffected(prototype)) ||
                    (this.isDecorated(prototype) && !this.isAffected(prototype))) &&
                    this.isPath(prototype)) {
                    const options = this.getOptions(isControllerDecorated ? controller.metatype : prototype);
                    if (options.type !== DecoratorType_1.DecoratorType.OBSERVER)
                        return;
                    const name = this.generateName(controller, prototype, options);
                    const metric = this.generateMetric(name, options['options']);
                    controller.metatype.prototype[key] = this.wrap(prototype, metric);
                    this.loggerService.log(`Mapped ${name}`, this.constructor.name);
                }
            }
        }
    }
    generateMetric(name, metricOptions) {
        const metric = this.metricService
            .getMeter()
            .createHistogram(name, metricOptions);
        return (time) => {
            metric.record(time, this.metricService.getLabels());
        };
    }
    generateName(provider, prototype, options) {
        return `${options?.name ?? provider.name}_${prototype.name}`.toLowerCase();
    }
};
DecoratorObserverMetricInjector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricService_1.MetricService,
        core_1.ModulesContainer])
], DecoratorObserverMetricInjector);
exports.DecoratorObserverMetricInjector = DecoratorObserverMetricInjector;
//# sourceMappingURL=DecoratorObserverMetricInjector.js.map