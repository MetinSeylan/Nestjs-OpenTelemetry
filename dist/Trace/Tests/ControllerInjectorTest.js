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
const wait_for_expect_1 = require("wait-for-expect");
describe('Tracing Controller Injector Test', () => {
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
    it(`should trace controller method`, async () => {
        let HelloController = class HelloController {
            hi() { }
        };
        __decorate([
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
        await (0, wait_for_expect_1.default)(() => expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Controller->HelloController.hi' }), expect.any(Object)));
        await app.close();
    });
    it(`should trace controller method exception`, async () => {
        let HelloController = class HelloController {
            hi() {
                throw new common_1.ForbiddenException();
            }
        };
        __decorate([
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
        await request(app.getHttpServer()).get('/hello').send().expect(403);
        await (0, wait_for_expect_1.default)(() => expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Controller->HelloController.hi',
            status: {
                code: 2,
                message: 'Forbidden',
            },
        }), expect.any(Object)));
        await app.close();
    });
    it(`should not trace controller method if there is no path`, async () => {
        let HelloController = class HelloController {
            hi() { }
        };
        HelloController = __decorate([
            (0, common_1.Controller)('hello')
        ], HelloController);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            controllers: [HelloController],
        }).compile();
        const app = context.createNestApplication();
        await app.init();
        const helloController = app.get(HelloController);
        helloController.hi();
        await (0, wait_for_expect_1.default)(() => expect(exporterSpy).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'Controller->HelloController.hi' }), expect.any(Object)));
        await app.close();
    });
    it(`should not trace controller method if already decorated`, async () => {
        let HelloController = class HelloController {
            hi() { }
        };
        __decorate([
            (0, common_1.Get)(),
            (0, Span_1.Span)('SLM_CNM'),
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
        await (0, wait_for_expect_1.default)(() => expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Controller->HelloController.SLM_CNM',
        }), expect.any(Object)));
        await app.close();
    });
});
//# sourceMappingURL=ControllerInjectorTest.js.map