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
exports.MetricInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const InterceptorProtocol_1 = require("./InterceptorProtocol");
const MetricHttpEventProducer_1 = require("./Http/MetricHttpEventProducer");
const microservices_1 = require("@nestjs/microservices");
const constants_1 = require("@nestjs/microservices/constants");
const MetricGrpcEventProducer_1 = require("./Grpc/MetricGrpcEventProducer");
const MetricRabbitMQEventProducer_1 = require("./RabbitMQ/MetricRabbitMQEventProducer");
let MetricInterceptor = class MetricInterceptor {
    metricHttpEventProducer;
    metricGrpcEventProducer;
    metricRabbitMQEventProducer;
    constructor(metricHttpEventProducer, metricGrpcEventProducer, metricRabbitMQEventProducer) {
        this.metricHttpEventProducer = metricHttpEventProducer;
        this.metricGrpcEventProducer = metricGrpcEventProducer;
        this.metricRabbitMQEventProducer = metricRabbitMQEventProducer;
    }
    intercept(context, next) {
        const protocol = this.getProtocol(context);
        const startAt = this.getStartAt(context, protocol);
        return next.handle().pipe(this.getFinalPipe(context, protocol, startAt));
    }
    getFinalPipe(context, protocol, startAt) {
        return (0, operators_1.tap)(() => this.calculate(context, protocol, startAt), (error) => this.calculate(context, protocol, startAt, error));
    }
    calculate(context, protocol, startAt, error) {
        const exception = this.getException(error);
        if (protocol === InterceptorProtocol_1.InterceptorProtocol.HTTP) {
            this.metricHttpEventProducer.onFinish(context, startAt, exception);
        }
        else if (protocol === InterceptorProtocol_1.InterceptorProtocol.RPC) {
            const transport = this.getRpcTransportProtocol(context);
            if (transport === microservices_1.Transport.GRPC) {
                this.metricGrpcEventProducer.onFinish(context, startAt, exception);
            }
            else if (transport === microservices_1.Transport.RMQ) {
                this.metricRabbitMQEventProducer.onFinish(context, startAt, exception);
            }
        }
    }
    getStartAt(context, protocol) {
        if (protocol === InterceptorProtocol_1.InterceptorProtocol.HTTP) {
            const request = context.switchToHttp().getRequest();
            return request.startAt;
        }
        return process.hrtime();
    }
    getProtocol(context) {
        switch (context.getType()) {
            case 'http':
                return InterceptorProtocol_1.InterceptorProtocol.HTTP;
            case 'rpc':
                return InterceptorProtocol_1.InterceptorProtocol.RPC;
            case 'ws':
                return InterceptorProtocol_1.InterceptorProtocol.WS;
            case 'graphql':
                return InterceptorProtocol_1.InterceptorProtocol.GQL;
        }
    }
    getRpcTransportProtocol(context) {
        const defined = Reflect.getMetadata(constants_1.TRANSPORT_METADATA, context.getHandler());
        if (defined)
            return defined;
        if (context.getArgByIndex(1) instanceof microservices_1.RmqContext) {
            return microservices_1.Transport.RMQ;
        }
    }
    getException(exception) {
        if (!exception)
            return '';
        if (exception.constructor?.name) {
            return exception.constructor.name;
        }
        else if (exception['name']) {
            return exception['name'];
        }
        else if (exception['code']) {
            return exception['code'];
        }
        else if (exception['message']) {
            return exception['message'];
        }
        return 'UNKNOWN';
    }
};
MetricInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricHttpEventProducer_1.MetricHttpEventProducer,
        MetricGrpcEventProducer_1.MetricGrpcEventProducer,
        MetricRabbitMQEventProducer_1.MetricRabbitMQEventProducer])
], MetricInterceptor);
exports.MetricInterceptor = MetricInterceptor;
//# sourceMappingURL=MetricInterceptor.js.map