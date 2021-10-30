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
exports.MetricHttpEventProducer = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const ProducerEvent_1 = require("../ProducerEvent");
const ProducerHttpEvent_1 = require("./ProducerHttpEvent");
let MetricHttpEventProducer = class MetricHttpEventProducer {
    eventEmitter;
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    onFinish(context, startAt, exception) {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();
        response.once('finish', () => this.publish(request, response, startAt, exception));
    }
    publish(request, response, startAt, exception) {
        const diff = process.hrtime(startAt);
        const time = diff[0] * 1e3 + diff[1] * 1e-6;
        this.eventEmitter.emit(ProducerEvent_1.ProducerEvent.HTTP, {
            time,
            labels: {
                exception,
                method: request.method,
                outcome: this.getOutcome(response),
                status: response.statusCode,
                uri: request.route.path,
            },
        });
    }
    getOutcome(response) {
        if (response.statusCode >= 100 && response.statusCode < 200) {
            return ProducerHttpEvent_1.Outcome.INFORMATIONAL;
        }
        else if (response.statusCode >= 200 && response.statusCode < 300) {
            return ProducerHttpEvent_1.Outcome.SUCCESS;
        }
        else if (response.statusCode >= 300 && response.statusCode < 400) {
            return ProducerHttpEvent_1.Outcome.REDIRECTION;
        }
        else if (response.statusCode >= 400 && response.statusCode < 500) {
            return ProducerHttpEvent_1.Outcome.CLIENT_ERROR;
        }
        else if (response.statusCode >= 500 && response.statusCode < 600) {
            return ProducerHttpEvent_1.Outcome.SERVER_ERROR;
        }
        return ProducerHttpEvent_1.Outcome.UNKNOWN;
    }
};
MetricHttpEventProducer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], MetricHttpEventProducer);
exports.MetricHttpEventProducer = MetricHttpEventProducer;
//# sourceMappingURL=MetricHttpEventProducer.js.map