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
exports.DecoratorInjector = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const BaseTraceInjector_1 = require("./BaseTraceInjector");
let DecoratorInjector = class DecoratorInjector extends BaseTraceInjector_1.BaseTraceInjector {
    modulesContainer;
    loggerService = new common_1.Logger();
    constructor(modulesContainer) {
        super(modulesContainer);
        this.modulesContainer = modulesContainer;
    }
    inject() {
        this.injectProviders();
        this.injectControllers();
    }
    injectProviders() {
        const providers = this.getProviders();
        for (const provider of providers) {
            if (this.isDecorated(provider.metatype)) {
                throw new Error(`@Span decorator not used with @Injectable provider class. Class: ${provider.name}`);
            }
            const keys = this.metadataScanner.getAllFilteredMethodNames(provider.metatype.prototype);
            for (const key of keys) {
                if (this.isDecorated(provider.metatype.prototype[key]) &&
                    !this.isAffected(provider.metatype.prototype[key])) {
                    provider.metatype.prototype[key] = this.wrap(provider.metatype.prototype[key], this.getPrefix(provider.metatype.prototype[key], `Provider->${provider.name}`));
                    this.loggerService.log(`Mapped ${provider.name}.${key}`, this.constructor.name);
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
                if ((isControllerDecorated &&
                    !this.isAffected(controller.metatype.prototype[key])) ||
                    (this.isDecorated(controller.metatype.prototype[key]) &&
                        !this.isAffected(controller.metatype.prototype[key]))) {
                    const method = this.wrap(controller.metatype.prototype[key], this.getPrefix(controller.metatype.prototype[key], `Controller->${controller.name}`));
                    this.reDecorate(controller.metatype.prototype[key], method);
                    controller.metatype.prototype[key] = method;
                    this.loggerService.log(`Mapped ${controller.name}.${key}`, this.constructor.name);
                }
            }
        }
    }
    getPrefix(prototype, type) {
        const name = this.getTraceName(prototype);
        if (name) {
            return `${type}.${name}`;
        }
        return `${type}.${prototype.name}`;
    }
};
DecoratorInjector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], DecoratorInjector);
exports.DecoratorInjector = DecoratorInjector;
//# sourceMappingURL=DecoratorInjector.js.map