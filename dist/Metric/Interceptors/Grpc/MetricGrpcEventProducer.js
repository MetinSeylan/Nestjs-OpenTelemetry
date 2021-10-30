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
exports.MetricGrpcEventProducer = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const ProducerEvent_1 = require("../ProducerEvent");
const constants_1 = require("@nestjs/microservices/constants");
let MetricGrpcEventProducer = class MetricGrpcEventProducer {
    eventEmitter;
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    onFinish(context, startAt, exception) {
        const labels = this.getLabels(context);
        if (labels.streaming !== 'no_stream')
            return;
        const grpcStream = context.getArgByIndex(2).call.stream;
        grpcStream.once('close', () => this.publish(startAt, exception, grpcStream, labels));
    }
    publish(startAt, exception, grpcStream, labels) {
        const diff = process.hrtime(startAt);
        const time = diff[0] * 1e3 + diff[1] * 1e-6;
        this.eventEmitter.emit(ProducerEvent_1.ProducerEvent.GRPC, {
            time,
            labels: {
                exception,
                status: grpcStream.sentTrailers['grpc-status'],
                ...labels,
            },
        });
    }
    getLabels(context) {
        return Reflect.getMetadata(constants_1.PATTERN_METADATA, context.getHandler()) || {};
    }
};
MetricGrpcEventProducer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], MetricGrpcEventProducer);
exports.MetricGrpcEventProducer = MetricGrpcEventProducer;
//# sourceMappingURL=MetricGrpcEventProducer.js.map