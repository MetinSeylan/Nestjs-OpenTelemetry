"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OpenTelemetryModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetryModule = void 0;
const common_1 = require("@nestjs/common");
const LoggerService_1 = require("./Tracing/LoggerService");
const core_1 = require("@nestjs/core");
const TraceInterceptor_1 = require("./Tracing/TraceInterceptor");
const TraceExceptionFilter_1 = require("./Tracing/TraceExceptionFilter");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const TraceService_1 = require("./Tracing/TraceService");
const Constants_1 = require("./Constants");
let OpenTelemetryModule = OpenTelemetryModule_1 = class OpenTelemetryModule {
    static async register(configuration) {
        return {
            global: true,
            module: OpenTelemetryModule_1,
            providers: [
                await this.createProvider(configuration),
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: TraceInterceptor_1.TraceInterceptor,
                },
                {
                    provide: core_1.APP_FILTER,
                    useClass: TraceExceptionFilter_1.TraceExceptionFilter,
                },
                LoggerService_1.LoggerService,
                TraceService_1.TraceService,
            ],
            exports: [
                LoggerService_1.LoggerService,
                TraceService_1.TraceService,
            ],
        };
    }
    static async createProvider(configuration) {
        const sdk = new sdk_node_1.NodeSDK(configuration);
        await sdk.start();
        return {
            provide: Constants_1.Constants.SDK,
            useValue: sdk,
        };
    }
};
OpenTelemetryModule = OpenTelemetryModule_1 = __decorate([
    common_1.Module({})
], OpenTelemetryModule);
exports.OpenTelemetryModule = OpenTelemetryModule;
//# sourceMappingURL=OpenTelemetryModule.js.map