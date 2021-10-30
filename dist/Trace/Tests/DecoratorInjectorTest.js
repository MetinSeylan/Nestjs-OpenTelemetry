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
const Constants_1 = require("../../Constants");
describe('Tracing Decorator Injector Test', () => {
    const exporter = new sdk_trace_base_1.NoopSpanProcessor();
    const exporterSpy = jest.spyOn(exporter, 'onStart');
    const sdkModule = OpenTelemetryModule_1.OpenTelemetryModule.forRoot({
        spanProcessor: exporter,
    });
    beforeEach(() => {
        exporterSpy.mockClear();
        exporterSpy.mockReset();
    });
    it(`should trace decorated provider method`, async () => {
        let HelloService = class HelloService {
            hi() { }
        };
        __decorate([
            (0, Span_1.Span)(),
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
        helloService.hi();
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Provider->HelloService.hi' }), expect.any(Object));
        await app.close();
    });
    it(`should trace decorated controller method`, async () => {
        let HelloController = class HelloController {
            hi() { }
        };
        __decorate([
            (0, Span_1.Span)(),
            (0, common_1.Get)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], HelloController.prototype, "hi", null);
        HelloController = __decorate([
            (0, common_1.Controller)('hello')
        ], HelloController);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            controllers: [HelloController],
        }).compile();
        const app = context.createNestApplication();
        await app.init();
        await request(app.getHttpServer()).get('/hello').send().expect(200);
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Controller->HelloController.hi' }), expect.any(Object));
        await app.close();
    });
    it(`should throw exception when Injectable and Span used same time`, async () => {
        let HelloService = class HelloService {
        };
        HelloService = __decorate([
            (0, Span_1.Span)(),
            (0, common_1.Injectable)()
        ], HelloService);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            providers: [HelloService],
        });
        await expect(context.compile()).rejects.toThrow(`@Span decorator not used with @Injectable provider class. Class: HelloService`);
    });
    it(`should trace decorated controller method with custom trace name`, async () => {
        let HelloController = class HelloController {
            hi() { }
        };
        __decorate([
            (0, Span_1.Span)('MAVI_VATAN'),
            (0, common_1.Get)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], HelloController.prototype, "hi", null);
        HelloController = __decorate([
            (0, common_1.Controller)('hello')
        ], HelloController);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            controllers: [HelloController],
        }).compile();
        const app = context.createNestApplication();
        await app.init();
        await request(app.getHttpServer()).get('/hello').send().expect(200);
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Controller->HelloController.MAVI_VATAN',
        }), expect.any(Object));
        await app.close();
    });
    it(`should not trace already tracing prototype`, async () => {
        let HelloService = class HelloService {
            hi() { }
        };
        __decorate([
            (0, Span_1.Span)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], HelloService.prototype, "hi", null);
        HelloService = __decorate([
            (0, common_1.Injectable)()
        ], HelloService);
        Reflect.defineMetadata(Constants_1.Constants.TRACE_METADATA_ACTIVE, 1, HelloService.prototype.hi);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            providers: [HelloService],
        }).compile();
        const app = context.createNestApplication();
        const helloService = app.get(HelloService);
        helloService.hi();
        expect(exporterSpy).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'Provider->HelloService.hi' }), expect.any(Object));
        await app.close();
    });
});
//# sourceMappingURL=DecoratorInjectorTest.js.map