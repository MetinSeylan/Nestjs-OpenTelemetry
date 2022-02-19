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
var HttpRequestDurationSeconds_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestDurationSeconds = void 0;
const MetricService_1 = require("../../MetricService");
const common_1 = require("@nestjs/common");
const api_metrics_1 = require("@opentelemetry/api-metrics");
const event_emitter_1 = require("@nestjs/event-emitter");
const ProducerEvent_1 = require("../../Interceptors/ProducerEvent");
let HttpRequestDurationSeconds = HttpRequestDurationSeconds_1 = class HttpRequestDurationSeconds {
    metricService;
    static metricOptions = {
        boundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        valueType: api_metrics_1.ValueType.DOUBLE,
    };
    name = 'http_request_duration_seconds';
    description = 'http_request_duration_seconds';
    histogram;
    constructor(metricService) {
        this.metricService = metricService;
    }
    async inject() {
        this.histogram = this.metricService
            .getProvider()
            .getMeter('default')
            .createHistogram(this.name, {
            ...HttpRequestDurationSeconds_1.metricOptions,
            description: this.description,
        });
    }
    onResult(event) {
        this.histogram.record(event.time, Object.assign(event.labels, this.metricService.getLabels()));
    }
    static build(metricOptions) {
        HttpRequestDurationSeconds_1.metricOptions = {
            ...HttpRequestDurationSeconds_1.metricOptions,
            ...metricOptions,
        };
        return HttpRequestDurationSeconds_1;
    }
};
__decorate([
    (0, event_emitter_1.OnEvent)(ProducerEvent_1.ProducerEvent.HTTP),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HttpRequestDurationSeconds.prototype, "onResult", null);
HttpRequestDurationSeconds = HttpRequestDurationSeconds_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricService_1.MetricService])
], HttpRequestDurationSeconds);
exports.HttpRequestDurationSeconds = HttpRequestDurationSeconds;
//# sourceMappingURL=HttpRequestDurationSeconds.js.map