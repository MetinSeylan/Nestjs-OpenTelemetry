import { Span } from '@opentelemetry/api';
export declare class TraceService {
    getTracer(): import("@opentelemetry/api").Tracer;
    getSpan(): Span;
    startSpan(name: string): Span;
}
