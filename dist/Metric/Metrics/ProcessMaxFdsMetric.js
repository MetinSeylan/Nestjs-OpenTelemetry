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
exports.ProcessMaxFdsMetric = void 0;
const MetricService_1 = require("../MetricService");
const common_1 = require("@nestjs/common");
const fs = require("fs");
let ProcessMaxFdsMetric = class ProcessMaxFdsMetric {
    metricService;
    name = 'process_max_fds';
    description = 'Maximum number of open file descriptors.';
    valueObserver;
    maxFds;
    constructor(metricService) {
        this.metricService = metricService;
    }
    async inject() {
        if (this.maxFds === undefined) {
            try {
                const limits = fs.readFileSync('/proc/self/limits', 'utf8');
                const lines = limits.split('\n');
                for (const line of lines) {
                    if (line.startsWith('Max open files')) {
                        const parts = line.split(/  +/);
                        this.maxFds = Number(parts[1]);
                        break;
                    }
                }
            }
            catch (e) {
                return;
            }
        }
        if (this.maxFds === undefined)
            return;
        this.valueObserver = this.metricService
            .getProvider()
            .getMeter('default')
            .createValueObserver(this.name, {
            description: this.description,
        }, (observerResult) => this.observerCallback(observerResult));
    }
    observerCallback(observerResult) {
        observerResult.observe(this.maxFds, this.metricService.getLabels());
    }
};
ProcessMaxFdsMetric = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricService_1.MetricService])
], ProcessMaxFdsMetric);
exports.ProcessMaxFdsMetric = ProcessMaxFdsMetric;
//# sourceMappingURL=ProcessMaxFdsMetric.js.map