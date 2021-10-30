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
exports.ProcessOpenFdsMetric = void 0;
const MetricService_1 = require("../MetricService");
const common_1 = require("@nestjs/common");
const fs = require("fs");
let ProcessOpenFdsMetric = class ProcessOpenFdsMetric {
    metricService;
    name = 'process_open_fds';
    description = 'Number of open file descriptors.';
    valueObserver;
    constructor(metricService) {
        this.metricService = metricService;
    }
    async inject() {
        if (process.platform !== 'linux') {
            return;
        }
        this.valueObserver = this.metricService
            .getProvider()
            .getMeter('default')
            .createValueObserver(this.name, {
            description: this.description,
        }, (observerResult) => this.observerCallback(observerResult));
    }
    observerCallback(observerResult) {
        try {
            const fds = fs.readdirSync('/dev/fd/');
            observerResult.observe(fds.length - 1, this.metricService.getLabels());
        }
        catch {
        }
    }
};
ProcessOpenFdsMetric = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricService_1.MetricService])
], ProcessOpenFdsMetric);
exports.ProcessOpenFdsMetric = ProcessOpenFdsMetric;
//# sourceMappingURL=ProcessOpenFdsMetric.js.map