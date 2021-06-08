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
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("@opentelemetry/api");
let LoggerService = class LoggerService extends common_1.Logger {
    constructor() {
        super();
    }
    getTraceId(message, attr) {
        const span = api_1.trace.getSpan(api_1.context.active());
        if (!span)
            return '';
        const spanContext = api_1.trace.getSpan(api_1.context.active()).spanContext();
        if (attr)
            span.setAttributes(attr);
        span.addEvent(message);
        return `[${spanContext.traceId}] `;
    }
    log(message, context, attr) {
        super.log(`${this.getTraceId(message, attr)}${message}`, context);
    }
    error(message, trace, context, attr) {
        super.error(`${this.getTraceId(message, attr)}${message}`, trace, context);
    }
    warn(message, context, attr) {
        super.warn(`${this.getTraceId(message, attr)}${message}`, context);
    }
    debug(message, context, attr) {
        super.debug(`${this.getTraceId(message, attr)}${message}`, context);
    }
    verbose(message, context, attr) {
        super.debug(`${this.getTraceId(message, attr)}${message}`, context);
    }
};
LoggerService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], LoggerService);
exports.LoggerService = LoggerService;
//# sourceMappingURL=LoggerService.js.map