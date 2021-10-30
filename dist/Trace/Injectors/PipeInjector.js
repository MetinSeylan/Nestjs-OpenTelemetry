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
exports.PipeInjector = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const BaseTraceInjector_1 = require("./BaseTraceInjector");
const constants_1 = require("@nestjs/common/constants");
let PipeInjector = class PipeInjector extends BaseTraceInjector_1.BaseTraceInjector {
    modulesContainer;
    loggerService = new common_1.Logger();
    constructor(modulesContainer) {
        super(modulesContainer);
        this.modulesContainer = modulesContainer;
    }
    inject() {
        const controllers = this.getControllers();
        for (const controller of controllers) {
            const keys = this.metadataScanner.getAllFilteredMethodNames(controller.metatype.prototype);
            for (const key of keys) {
                if (this.isPath(controller.metatype.prototype[key])) {
                    const pipes = this.getPipes(controller.metatype.prototype[key]).map((pipe) => this.wrapPipe(pipe, controller, controller.metatype.prototype[key]));
                    if (pipes.length > 0) {
                        Reflect.defineMetadata(constants_1.PIPES_METADATA, pipes, controller.metatype.prototype[key]);
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
                provider.token.includes(core_1.APP_PIPE) &&
                !this.isAffected(provider.metatype.prototype.transform)) {
                const traceName = `Pipe->Global->${provider.metatype.name}`;
                provider.metatype.prototype.transform = this.wrap(provider.metatype.prototype.transform, traceName, {
                    pipe: provider.metatype.name,
                    scope: 'GLOBAL',
                });
                this.loggerService.log(`Mapped ${traceName}`, this.constructor.name);
            }
        }
    }
    wrapPipe(pipe, controller, prototype) {
        const pipeProto = pipe['prototype'] ?? pipe;
        if (this.isAffected(pipeProto.transform))
            return pipe;
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
    getPipes(prototype) {
        return Reflect.getMetadata(constants_1.PIPES_METADATA, prototype) || [];
    }
};
PipeInjector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], PipeInjector);
exports.PipeInjector = PipeInjector;
//# sourceMappingURL=PipeInjector.js.map