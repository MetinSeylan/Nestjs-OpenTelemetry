import { Inject, Injectable } from '@nestjs/common';
import { Constants } from '../Constants';
import { OpenTelemetryModuleConfig } from '../OpenTelemetryModuleConfig';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Meter } from '@opentelemetry/api-metrics';

@Injectable()
export class MetricService {
  private readonly meterProvider: MeterProvider;

  constructor(
    @Inject(Constants.SDK_CONFIG)
    private readonly sdkConfig: OpenTelemetryModuleConfig,
    @Inject(Constants.SDK) private readonly nodeSDK: NodeSDK,
  ) {
    this.meterProvider = new MeterProvider();
    if (sdkConfig.metricReader) {
      this.meterProvider.addMetricReader(sdkConfig.metricReader);
    }
  }

  public getMeter(): Meter {
    return this.meterProvider.getMeter('default');
  }

  public getProvider(): MeterProvider {
    return this.meterProvider;
  }
}
