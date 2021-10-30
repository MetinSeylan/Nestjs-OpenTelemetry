import { Constants } from '../../Constants';
import { MetricOptions } from '@opentelemetry/api-metrics';
export declare const Counter: (name?: string, options?: MetricOptions) => import("@nestjs/common").CustomDecorator<Constants>;
