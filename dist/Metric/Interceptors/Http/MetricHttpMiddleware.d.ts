import { NestMiddleware } from '@nestjs/common';
export declare class MetricHttpMiddleware implements NestMiddleware {
    use(req: any, res: any, next: any): void;
}
