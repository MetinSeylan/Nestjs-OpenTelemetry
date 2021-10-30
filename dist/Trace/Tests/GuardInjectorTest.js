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
const request = require("supertest");
const GuardInjector_1 = require("../Injectors/GuardInjector");
const core_1 = require("@nestjs/core");
const Span_1 = require("../Decorators/Span");
describe('Tracing Guard Injector Test', () => {
    const exporter = new sdk_trace_base_1.NoopSpanProcessor();
    const exporterSpy = jest.spyOn(exporter, 'onStart');
    const sdkModule = OpenTelemetryModule_1.OpenTelemetryModule.forRoot({
        spanProcessor: exporter,
        traceAutoInjectors: [GuardInjector_1.GuardInjector],
    });
    beforeEach(() => {
        exporterSpy.mockClear();
        exporterSpy.mockReset();
    });
    it(`should trace guarded controller`, async () => {
        class VeyselEfendi {
            canActivate(context) {
                return true;
            }
        }
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
            (0, common_1.UseGuards)(VeyselEfendi),
            (0, common_1.Controller)('hello')
        ], HelloController);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            controllers: [HelloController],
        }).compile();
        const app = context.createNestApplication();
        await app.init();
        await request(app.getHttpServer()).get('/hello').send().expect(200);
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Guard->HelloController.VeyselEfendi' }), expect.any(Object));
        await app.close();
    });
    it(`should trace guarded controller method`, async () => {
        class VeyselEfendi {
            canActivate(context) {
                return true;
            }
        }
        let HelloController = class HelloController {
            hi() { }
        };
        __decorate([
            (0, common_1.Get)(),
            (0, common_1.UseGuards)(VeyselEfendi),
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
            name: 'Guard->HelloController.hi.VeyselEfendi',
        }), expect.any(Object));
        await app.close();
    });
    it(`should trace guarded and decorated controller method`, async () => {
        class VeyselEfendi {
            canActivate(context) {
                return true;
            }
        }
        let HelloController = class HelloController {
            hi() { }
        };
        __decorate([
            (0, common_1.Get)(),
            (0, Span_1.Span)('comolokko'),
            (0, common_1.UseGuards)(VeyselEfendi),
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
            name: 'Guard->HelloController.hi.VeyselEfendi',
        }), expect.any(Object));
        await app.close();
    });
    it(`should trace global guard`, async () => {
        class VeyselEfendi {
            canActivate(context) {
                return true;
            }
        }
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
            providers: [
                {
                    provide: core_1.APP_GUARD,
                    useClass: VeyselEfendi,
                },
            ],
        }).compile();
        const app = context.createNestApplication();
        await app.init();
        await request(app.getHttpServer()).get('/hello').send().expect(200);
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Guard->Global->VeyselEfendi' }), expect.any(Object));
        await app.close();
    });
});
//# sourceMappingURL=GuardInjectorTest.js.map