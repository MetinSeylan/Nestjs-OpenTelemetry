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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStartTimeMetric = void 0;
const MetricService_1 = require("../MetricService");
const common_1 = require("@nestjs/common");
const api_metrics_1 = require("@opentelemetry/api-metrics");
let ProcessStartTimeMetric = class ProcessStartTimeMetric {
    metricService;
    name = 'process_start_time_seconds';
    description = 'Start time of the process since unix epoch in seconds.';
    observableGauge;
    uptimeInSecond = Math.round(Date.now() / 1000 - process.uptime());
    constructor(metricService) {
        this.metricService = metricService;
    }
    async inject() {
        this.observableGauge = this.metricService
            .getProvider()
            .getMeter('default')
            .createObservableGauge(this.name, {
            description: this.description,
            aggregationTemporality: api_metrics_1.AggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
        }, (observerResult) => this.observerCallback(observerResult));
    }
    observerCallback(observerResult) {
        observerResult.observe(this.uptimeInSecond, this.metricService.getLabels());
    }
};
ProcessStartTimeMetric = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricService_1.MetricService])
], ProcessStartTimeMetric);
exports.ProcessStartTimeMetric = ProcessStartTimeMetric;
//# sourceMappingURL=ProcessStartTimeMetric.js.map