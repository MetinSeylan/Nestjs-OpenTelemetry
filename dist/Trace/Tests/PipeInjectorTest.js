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
const PipeInjector_1 = require("../Injectors/PipeInjector");
const constants_1 = require("@nestjs/common/constants");
const core_1 = require("@nestjs/core");
describe('Tracing Pipe Injector Test', () => {
    const exporter = new sdk_trace_base_1.NoopSpanProcessor();
    const exporterSpy = jest.spyOn(exporter, 'onStart');
    const sdkModule = OpenTelemetryModule_1.OpenTelemetryModule.forRoot({
        spanProcessor: exporter,
        traceAutoInjectors: [PipeInjector_1.PipeInjector],
    });
    beforeEach(() => {
        exporterSpy.mockClear();
        exporterSpy.mockReset();
    });
    it(`should trace global pipe`, async function () {
        class HelloPipe {
            async transform(value) { }
        }
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            providers: [{ provide: core_1.APP_PIPE, useClass: HelloPipe }],
        }).compile();
        const app = context.createNestApplication();
        await app.init();
        const injector = app.get(PipeInjector_1.PipeInjector);
        const providers = injector.getProviders();
        for await (const provider of providers) {
            if (typeof provider.token === 'string' &&
                provider.token.includes(core_1.APP_PIPE)) {
                await provider.metatype.prototype.transform(1);
            }
        }
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pipe->Global->HelloPipe' }), expect.any(Object));
        await app.close();
    });
    it(`should trace controller pipe`, async function () {
        class HelloPipe {
            async transform(value, metadata) { }
        }
        let HelloController = class HelloController {
            async hi() { }
        };
        __decorate([
            (0, common_1.Get)(),
            (0, common_1.UsePipes)(HelloPipe),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", Promise)
        ], HelloController.prototype, "hi", null);
        HelloController = __decorate([
            (0, common_1.Controller)('hello')
        ], HelloController);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            controllers: [HelloController],
        }).compile();
        const app = context.createNestApplication();
        const helloController = app.get(HelloController);
        await app.init();
        const pipes = Reflect.getMetadata(constants_1.PIPES_METADATA, helloController.hi);
        await pipes[0].transform(1);
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pipe->HelloController.hi.HelloPipe' }), expect.any(Object));
        await app.close();
    });
});
//# sourceMappingURL=PipeInjectorTest.js.map