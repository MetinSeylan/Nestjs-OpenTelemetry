"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricService = void 0;
const common_1 = require("@nestjs/common");
const Constants_1 = require("../Constants");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const sdk_metrics_base_1 = require("@opentelemetry/sdk-metrics-base");
let MetricService = class MetricService {
    sdkConfig;
    nodeSDK;
    meterProvider;
    constructor(sdkConfig, nodeSDK) {
        this.sdkConfig = sdkConfig;
        this.nodeSDK = nodeSDK;
        this.meterProvider = new sdk_metrics_base_1.MeterProvider({
            exporter: sdkConfig.metricExporter,
            interval: sdkConfig.metricInterval,
        });
    }
    getMeter() {
        return this.meterProvider.getMeter('default');
    }
    getProvider() {
        return this.meterProvider;
    }
    getLabels() {
        const attr = this.nodeSDK['_resource']?.attributes ?? {};
        delete attr['process.command'];
        delete attr['process.executable.name'];
        delete attr['process.pid'];
        delete attr['process.command_line'];
        return attr;
    }
};
MetricService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(Constants_1.Constants.SDK_CONFIG)),
    __param(1, (0, common_1.Inject)(Constants_1.Constants.SDK)),
    __metadata("design:paramtypes", [Object, sdk_node_1.NodeSDK])
], MetricService);
exports.MetricService = MetricService;
//# sourceMappingURL=MetricService.js.map