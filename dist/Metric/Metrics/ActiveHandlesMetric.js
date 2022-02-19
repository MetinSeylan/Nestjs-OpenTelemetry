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
exports.ActiveHandlesMetric = void 0;
const MetricService_1 = require("../MetricService");
const common_1 = require("@nestjs/common");
let ActiveHandlesMetric = class ActiveHandlesMetric {
    metricService;
    name = 'nodejs_active_handles';
    description = 'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.';
    observableGauge;
    constructor(metricService) {
        this.metricService = metricService;
    }
    async inject() {
        if (typeof process['_getActiveHandles'] !== 'function') {
            return;
        }
        this.observableGauge = this.metricService
            .getProvider()
            .getMeter('default')
            .createObservableGauge(this.name, {
            description: this.description,
        }, (observerResult) => this.observerCallback(observerResult));
    }
    observerCallback(observerResult) {
        const handles = process._getActiveHandles();
        const data = this.aggregateByObjectName(handles);
        for (const key in data) {
            observerResult.observe(data[key], Object.assign({ type: key }, this.metricService.getLabels() || {}));
        }
    }
    aggregateByObjectName(list) {
        const data = {};
        for (let i = 0; i < list.length; i++) {
            const listElement = list[i];
            if (!listElement || typeof listElement.constructor === 'undefined') {
                continue;
            }
            if (Object.hasOwnProperty.call(data, listElement.constructor.name)) {
                data[listElement.constructor.name] += 1;
            }
            else {
                data[listElement.constructor.name] = 1;
            }
        }
        return data;
    }
};
ActiveHandlesMetric = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricService_1.MetricService])
], ActiveHandlesMetric);
exports.ActiveHandlesMetric = ActiveHandlesMetric;
//# sourceMappingURL=ActiveHandlesMetric.js.map