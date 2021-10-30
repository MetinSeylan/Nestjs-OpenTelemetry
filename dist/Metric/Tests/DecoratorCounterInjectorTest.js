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
const common_1 = require("@nestjs/common");
const core_1 = require("@opentelemetry/core");
const Counter_1 = require("../Decorators/Counter");
const wait_for_expect_1 = require("wait-for-expect");
describe('Decorator Counter Injector Test', () => {
    const exporter = jest.fn();
    const sdkModule = OpenTelemetryModule_1.OpenTelemetryModule.forRoot({
        metricExporter: { export: exporter, shutdown: jest.fn() },
        metricInterval: 10,
        sampler: new core_1.AlwaysOnSampler(),
    });
    beforeEach(() => {
        exporter.mockClear();
        exporter.mockReset();
    });
    it(`should count decorated provider method`, async () => {
        let HelloService = class HelloService {
            hi() { }
        };
        __decorate([
            (0, Counter_1.Counter)(),
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
        await (0, wait_for_expect_1.default)(() => expect(exporter).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                descriptor: {
                    name: 'helloservice_hi',
                    description: '',
                    unit: '1',
                    metricKind: 0,
                    valueType: 1,
                },
            }),
        ]), expect.any(Function)));
        await app.close();
    });
});
//# sourceMappingURL=DecoratorCounterInjectorTest.js.map