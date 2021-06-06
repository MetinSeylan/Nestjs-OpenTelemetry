"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Span = void 0;
const api_1 = require("@opentelemetry/api");
function Span(name) {
    return (target, propertyKey, propertyDescriptor) => {
        const method = propertyDescriptor.value;
        propertyDescriptor.value = function (...args) {
            const currentSpan = api_1.trace.getSpan(api_1.context.active());
            const tracer = api_1.trace.getTracer('default');
            return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), currentSpan), () => {
                const span = tracer.startSpan(name ? name : `${target.constructor.name}.${propertyKey}`);
                if (method.constructor.name === 'AsyncFunction') {
                    return method.apply(this, args).finally(() => {
                        span.end();
                    });
                }
                else {
                    const result = method.apply(this, args);
                    span.end();
                    return result;
                }
            });
        };
    };
}
exports.Span = Span;
//# sourceMappingURL=Span.js.map