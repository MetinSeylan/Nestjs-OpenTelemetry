import { DynamicModule, Module, Provider } from '@nestjs/common';
import { LoggerService } from './Tracing/LoggerService';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TraceInterceptor } from './Tracing/TraceInterceptor';
import { TraceExceptionFilter } from './Tracing/TraceExceptionFilter';
import { NodeSDK, NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { TraceService } from './Tracing/TraceService';
import { Constants } from './Constants';

@Module({})
export class OpenTelemetryModule {
  static async register(
    configuration?: Partial<NodeSDKConfiguration>,
  ): Promise<DynamicModule> {
    return {
      global: true,
      module: OpenTelemetryModule,
      providers: [
        await this.createProvider(configuration),
        {
          provide: APP_INTERCEPTOR,
          useClass: TraceInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: TraceExceptionFilter,
        },
        LoggerService,
        TraceService,
      ],
      exports: [
        LoggerService,
        TraceService,
      ],
    };
  }

  private static async createProvider(
    configuration?: Partial<NodeSDKConfiguration>,
  ): Promise<Provider> {
    const sdk = new NodeSDK(configuration);
    await sdk.start();
    return {
      provide: Constants.SDK,
      useValue: sdk,
    };
  }
}
