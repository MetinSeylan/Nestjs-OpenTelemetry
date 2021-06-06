import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
export declare class TraceInterceptor implements NestInterceptor {
    intercept(executionContext: ExecutionContext, next: CallHandler): Promise<import("rxjs").Observable<any>>;
}
