"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggerInjector_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerInjector = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("@opentelemetry/api");
let LoggerInjector = LoggerInjector_1 = class LoggerInjector {
    inject() {
        common_1.ConsoleLogger.prototype.log = this.wrapPrototype(common_1.ConsoleLogger.prototype.log);
        common_1.ConsoleLogger.prototype.debug = this.wrapPrototype(common_1.ConsoleLogger.prototype.debug);
        common_1.ConsoleLogger.prototype.error = this.wrapPrototype(common_1.ConsoleLogger.prototype.error);
        common_1.ConsoleLogger.prototype.verbose = this.wrapPrototype(common_1.ConsoleLogger.prototype.verbose);
        common_1.ConsoleLogger.prototype.warn = this.wrapPrototype(common_1.ConsoleLogger.prototype.warn);
    }
    wrapPrototype(prototype) {
        return {
            [prototype.name]: function (...args) {
                args[0] = LoggerInjector_1.getMessage(args[0]);
                prototype.apply(this, args);
            },
        }[prototype.name];
    }
    static getMessage(message) {
        const currentSpan = api_1.trace.getSpan(api_1.context.active());
        if (!currentSpan)
            return message;
        const spanContext = api_1.trace.getSpan(api_1.context.active()).spanContext();
        currentSpan.addEvent(message);
        return `[${spanContext.traceId}] ${message}`;
    }
};
LoggerInjector = LoggerInjector_1 = __decorate([
    (0, common_1.Injectable)()
], LoggerInjector);
exports.LoggerInjector = LoggerInjector;
//# sourceMappingURL=LoggerInjector.js.map