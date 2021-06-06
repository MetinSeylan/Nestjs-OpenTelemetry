"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceInterceptor = void 0;
const api_1 = require("@opentelemetry/api");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let TraceInterceptor = class TraceInterceptor {
    async intercept(executionContext, next) {
        return next.handle().pipe(operators_1.map((data) => {
            const req = executionContext.switchToHttp().getRequest();
            const span = api_1.trace.getSpan(api_1.context.active());
            const spanContext = span.spanContext();
            req.res.header('x-b3-traceid', spanContext.traceId);
            req.res.header('x-b3-spanid', spanContext.spanId);
            if (span['parentSpanId'])
                req.res.header('x-b3-parentspanid', span['parentSpanId']);
            return data;
        }));
    }
};
TraceInterceptor = __decorate([
    common_1.Injectable()
], TraceInterceptor);
exports.TraceInterceptor = TraceInterceptor;
//# sourceMappingURL=TraceInterceptor.js.map