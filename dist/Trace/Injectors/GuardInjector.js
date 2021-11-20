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
exports.GuardInjector = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const BaseTraceInjector_1 = require("./BaseTraceInjector");
const constants_1 = require("@nestjs/common/constants");
let GuardInjector = class GuardInjector extends BaseTraceInjector_1.BaseTraceInjector {
    modulesContainer;
    loggerService = new common_1.Logger();
    constructor(modulesContainer) {
        super(modulesContainer);
        this.modulesContainer = modulesContainer;
    }
    inject() {
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
                    Reflect.defineMetadata(constants_1.GUARDS_METADATA, guards, controller.metatype);
                }
            }
            const keys = this.metadataScanner.getAllFilteredMethodNames(controller.metatype.prototype);
            for (const key of keys) {
                if (this.isGuarded(controller.metatype.prototype[key])) {
                    const guards = this.getGuards(controller.metatype.prototype[key]).map((guard) => {
                        const prototype = guard['prototype'] ?? guard;
                        const traceName = `Guard->${controller.name}.${controller.metatype.prototype[key].name}.${prototype.constructor.name}`;
                        prototype.canActivate = this.wrap(prototype.canActivate, traceName, {
                            controller: controller.name,
                            guard: prototype.constructor.name,
                            method: controller.metatype.prototype[key].name,
                            scope: 'CONTROLLER_METHOD',
                        });
                        Object.assign(prototype, this);
                        this.loggerService.log(`Mapped ${traceName}`, this.constructor.name);
                        return guard;
                    });
                    if (guards.length > 0) {
                        Reflect.defineMetadata(constants_1.GUARDS_METADATA, guards, controller.metatype.prototype[key]);
                    }
                }
            }
        }
        this.injectGlobals();
    }
    injectGlobals() {
        const providers = this.getProviders();
        for (const provider of providers) {
            if (typeof provider.token === 'string' &&
                provider.token.includes(core_1.APP_GUARD) &&
                !this.isAffected(provider.metatype.prototype.canActivate)) {
                const traceName = `Guard->Global->${provider.metatype.name}`;
                provider.metatype.prototype.canActivate = this.wrap(provider.metatype.prototype.canActivate, traceName, {
                    guard: provider.metatype.name,
                    scope: 'GLOBAL',
                });
                Object.assign(provider.metatype.prototype, this);
                this.loggerService.log(`Mapped ${traceName}`, this.constructor.name);
            }
        }
    }
    getGuards(prototype) {
        return Reflect.getMetadata(constants_1.GUARDS_METADATA, prototype) || [];
    }
    isGuarded(prototype) {
        return Reflect.hasMetadata(constants_1.GUARDS_METADATA, prototype);
    }
};
GuardInjector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], GuardInjector);
exports.GuardInjector = GuardInjector;
//# sourceMappingURL=GuardInjector.js.map