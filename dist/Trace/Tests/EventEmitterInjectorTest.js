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
const EventEmitterInjector_1 = require("../Injectors/EventEmitterInjector");
const event_emitter_1 = require("@nestjs/event-emitter");
describe('Tracing Event Emitter Injector Test', () => {
    const exporter = new sdk_trace_base_1.NoopSpanProcessor();
    const exporterSpy = jest.spyOn(exporter, 'onStart');
    const sdkModule = OpenTelemetryModule_1.OpenTelemetryModule.forRoot({
        spanProcessor: exporter,
        traceAutoInjectors: [EventEmitterInjector_1.EventEmitterInjector],
    });
    beforeEach(() => {
        exporterSpy.mockClear();
        exporterSpy.mockReset();
    });
    it(`should trace event consumer method`, async () => {
        let HelloService = class HelloService {
            hi() { }
        };
        __decorate([
            (0, event_emitter_1.OnEvent)('selam'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], HelloService.prototype, "hi", null);
        HelloService = __decorate([
            (0, common_1.Injectable)()
        ], HelloService);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            providers: [HelloService],
        }).compile();
        const app = context.createNestApplication();
        const helloService = app.get(HelloService);
        await app.init();
        helloService.hi();
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Event->HelloService.selam' }), expect.any(Object));
        await app.close();
    });
    it(`should not trace already decorated event consumer method`, async () => {
        let HelloService = class HelloService {
            hi() { }
        };
        __decorate([
            (0, Span_1.Span)('untraceable'),
            (0, event_emitter_1.OnEvent)('tb2'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], HelloService.prototype, "hi", null);
        HelloService = __decorate([
            (0, common_1.Injectable)()
        ], HelloService);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            providers: [HelloService],
        }).compile();
        const app = context.createNestApplication();
        const helloService = app.get(HelloService);
        await app.init();
        helloService.hi();
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Provider->HelloService.untraceable' }), expect.any(Object));
        await app.close();
    });
});
//# sourceMappingURL=EventEmitterInjectorTest.js.map