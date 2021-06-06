"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const api_1 = require("@opentelemetry/api");
let TraceExceptionFilter = class TraceExceptionFilter extends core_1.BaseExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const span = api_1.trace.getSpan(api_1.context.active());
        const spanContext = span.spanContext();
        span.setStatus({
            code: api_1.SpanStatusCode.ERROR,
            message: JSON.stringify(exception),
        });
        response.header('x-b3-traceid', spanContext.traceId);
        response.header('x-b3-spanid', spanContext.spanId);
        if (span['parentSpanId'])
            response.header('x-b3-parentspanid', span['parentSpanId']);
        super.catch(exception, host);
    }
};
TraceExceptionFilter = __decorate([
    common_1.Catch()
], TraceExceptionFilter);
exports.TraceExceptionFilter = TraceExceptionFilter;
//# sourceMappingURL=TraceExceptionFilter.js.map