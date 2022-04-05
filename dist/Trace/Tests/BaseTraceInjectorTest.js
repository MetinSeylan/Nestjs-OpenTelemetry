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
const testing_1 = require("@nestjs/testing");
const OpenTelemetryModule_1 = require("../../OpenTelemetryModule");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const common_1 = require("@nestjs/common");
const Span_1 = require("../Decorators/Span");
const request = require("supertest");
const ControllerInjector_1 = require("../Injectors/ControllerInjector");
describe('Base Trace Injector Test', () => {
    const exporter = new sdk_trace_base_1.NoopSpanProcessor();
    const exporterSpy = jest.spyOn(exporter, 'onStart');
    const sdkModule = OpenTelemetryModule_1.OpenTelemetryModule.forRoot({
        spanProcessor: exporter,
        traceAutoInjectors: [ControllerInjector_1.ControllerInjector],
    });
    beforeEach(() => {
        exporterSpy.mockClear();
        exporterSpy.mockReset();
    });
    it('should create spans that inherit the ids of their parents', async () => {
        let HelloService = class HelloService {
            hello() {
                this.helloAgain();
            }
            helloAgain() { }
        };
        __decorate([
            (0, Span_1.Span)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], HelloService.prototype, "hello", null);
        __decorate([
            (0, Span_1.Span)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], HelloService.prototype, "helloAgain", null);
        HelloService = __decorate([
            (0, common_1.Injectable)()
        ], HelloService);
        let HelloController = class HelloController {
            service;
            constructor(service) {
                this.service = service;
            }
            hi() {
                return this.service.hello();
            }
        };
        __decorate([
            (0, common_1.Get)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], HelloController.prototype, "hi", null);
        HelloController = __decorate([
            (0, common_1.Controller)('hello'),
            __metadata("design:paramtypes", [HelloService])
        ], HelloController);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            providers: [HelloService],
            controllers: [HelloController],
        }).compile();
        const app = context.createNestApplication();
        await app.init();
        await request(app.getHttpServer()).get('/hello').send().expect(200);
        const [[parent], [childOfParent], [childOfChild]] = exporterSpy.mock.calls;
        expect(parent.parentSpanId).toBeUndefined();
        expect(childOfParent.parentSpanId).toBe(parent.spanContext().spanId);
        expect(childOfChild.parentSpanId).toBe(childOfParent.spanContext().spanId);
        await app.close();
    });
});
//# sourceMappingURL=BaseTraceInjectorTest.js.map