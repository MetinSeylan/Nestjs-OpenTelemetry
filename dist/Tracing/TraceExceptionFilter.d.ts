import { ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
export declare class TraceExceptionFilter extends BaseExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
