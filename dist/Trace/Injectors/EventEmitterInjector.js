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
var EventEmitterInjector_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitterInjector = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const BaseTraceInjector_1 = require("./BaseTraceInjector");
const ProducerEvent_1 = require("../../Metric/Interceptors/ProducerEvent");
let EventEmitterInjector = EventEmitterInjector_1 = class EventEmitterInjector extends BaseTraceInjector_1.BaseTraceInjector {
    modulesContainer;
    static EVENT_LISTENER_METADATA = 'EVENT_LISTENER_METADATA';
    loggerService = new common_1.Logger();
    constructor(modulesContainer) {
        super(modulesContainer);
        this.modulesContainer = modulesContainer;
    }
    inject() {
        const providers = this.getProviders();
        for (const provider of providers) {
            const keys = this.metadataScanner.getAllFilteredMethodNames(provider.metatype.prototype);
            for (const key of keys) {
                if (!this.isDecorated(provider.metatype.prototype[key]) &&
                    !this.isAffected(provider.metatype.prototype[key]) &&
                    this.isEventConsumer(provider.metatype.prototype[key])) {
                    const eventName = this.getEventName(provider.metatype.prototype[key]);
                    provider.metatype.prototype[key] = this.wrap(provider.metatype.prototype[key], `Event->${provider.name}.${eventName}`, {
                        instance: provider.name,
                        method: provider.metatype.prototype[key].name,
                        event: eventName,
                    });
                    this.loggerService.log(`Mapped ${provider.name}.${key}`, this.constructor.name);
                }
            }
        }
    }
    isEventConsumer(prototype) {
        const meta = Reflect.getMetadata(EventEmitterInjector_1.EVENT_LISTENER_METADATA, prototype);
        if (!meta)
            return false;
        return !Object.values(ProducerEvent_1.ProducerEvent).includes(meta.event);
    }
    getEventName(prototype) {
        const metadata = Reflect.getMetadata(EventEmitterInjector_1.EVENT_LISTENER_METADATA, prototype);
        return metadata.event;
    }
};
EventEmitterInjector = EventEmitterInjector_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], EventEmitterInjector);
exports.EventEmitterInjector = EventEmitterInjector;
//# sourceMappingURL=EventEmitterInjector.js.map