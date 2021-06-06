import { Logger } from '@nestjs/common';
export declare class LoggerService extends Logger {
    constructor();
    private getTraceId;
    log(message: any, context?: string, attr?: Record<string, any>): void;
    error(message: any, trace?: string, context?: string, attr?: Record<string, any>): void;
    warn(message: any, context?: string, attr?: Record<string, any>): void;
    debug(message: any, context?: string, attr?: Record<string, any>): void;
    verbose(message: any, context?: string, attr?: Record<string, any>): void;
}
