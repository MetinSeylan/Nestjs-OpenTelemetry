import { Inject, Injectable } from '@nestjs/common';
import { Constants } from '../Constants';
import { OpenTelemetryModuleConfig } from '../OpenTelemetryModuleConfig';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Meter, MeterProvider } from '@opentelemetry/sdk-metrics-base';

@Injectable()
export class MetricService {
  private readonly meterProvider: MeterProvider;

  constructor(
    @Inject(Constants.SDK_CONFIG)
    private readonly sdkConfig: OpenTelemetryModuleConfig,
    @Inject(Constants.SDK) private readonly nodeSDK: NodeSDK,
  ) {
    this.meterProvider = new MeterProvider({
      // @ts-ignore
      exporter: sdkConfig.metricExporter,
      interval: sdkConfig.metricInterval,
    });
  }

  public getMeter(): Meter {
    return this.meterProvider.getMeter('default');
  }

  public getProvider(): MeterProvider {
    return this.meterProvider;
  }

  public getLabels(): Record<string, any> {
    const attr = this.nodeSDK['_resource']?.attributes ?? {};
    delete attr['process.command'];
    delete attr['process.executable.name'];
    delete attr['process.pid'];
    delete attr['process.command_line'];

    attr['application'] = this.sdkConfig.applicationName;

    return attr;
  }
}
