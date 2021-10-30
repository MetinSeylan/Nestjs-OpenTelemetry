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
var ScheduleInjector_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleInjector = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const BaseTraceInjector_1 = require("./BaseTraceInjector");
let ScheduleInjector = ScheduleInjector_1 = class ScheduleInjector extends BaseTraceInjector_1.BaseTraceInjector {
    modulesContainer;
    static SCHEDULE_CRON_OPTIONS = 'SCHEDULE_CRON_OPTIONS';
    static SCHEDULE_INTERVAL_OPTIONS = 'SCHEDULE_INTERVAL_OPTIONS';
    static SCHEDULE_TIMEOUT_OPTIONS = 'SCHEDULE_TIMEOUT_OPTIONS';
    static SCHEDULER_NAME = 'SCHEDULER_NAME';
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
                    this.isScheduler(provider.metatype.prototype[key])) {
                    const name = this.getName(provider, provider.metatype.prototype[key]);
                    provider.metatype.prototype[key] = this.wrap(provider.metatype.prototype[key], name);
                    this.loggerService.log(`Mapped ${name}`, this.constructor.name);
                }
            }
        }
    }
    isScheduler(prototype) {
        return (this.isCron(prototype) ||
            this.isTimeout(prototype) ||
            this.isInterval(prototype));
    }
    isCron(prototype) {
        return Reflect.hasMetadata(ScheduleInjector_1.SCHEDULE_CRON_OPTIONS, prototype);
    }
    isTimeout(prototype) {
        return Reflect.hasMetadata(ScheduleInjector_1.SCHEDULE_TIMEOUT_OPTIONS, prototype);
    }
    isInterval(prototype) {
        return Reflect.hasMetadata(ScheduleInjector_1.SCHEDULE_INTERVAL_OPTIONS, prototype);
    }
    getName(provider, prototype) {
        if (this.isCron(prototype)) {
            const options = Reflect.getMetadata(ScheduleInjector_1.SCHEDULE_CRON_OPTIONS, prototype);
            if (options && options.name) {
                return `Scheduler->Cron->${provider.name}.${options.name}`;
            }
            return `Scheduler->Cron->${provider.name}.${prototype.name}`;
        }
        if (this.isTimeout(prototype)) {
            const name = Reflect.getMetadata(ScheduleInjector_1.SCHEDULER_NAME, prototype);
            if (name) {
                return `Scheduler->Timeout->${provider.name}.${name}`;
            }
            return `Scheduler->Timeout->${provider.name}.${prototype.name}`;
        }
        if (this.isInterval(prototype)) {
            const name = Reflect.getMetadata(ScheduleInjector_1.SCHEDULER_NAME, prototype);
            if (name) {
                return `Scheduler->Interval->${provider.name}.${name}`;
            }
            return `Scheduler->Interval->${provider.name}.${prototype.name}`;
        }
    }
};
ScheduleInjector = ScheduleInjector_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], ScheduleInjector);
exports.ScheduleInjector = ScheduleInjector;
//# sourceMappingURL=ScheduleInjector.js.map