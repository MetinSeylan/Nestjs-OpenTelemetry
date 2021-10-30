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
const HttpRequestDurationSeconds_1 = require("../Metrics/Http/HttpRequestDurationSeconds");
const core_1 = require("@opentelemetry/core");
const wait_for_expect_1 = require("wait-for-expect");
const request = require("supertest");
describe('Metric Http Test', () => {
    const exporter = jest.fn();
    const sdkModule = OpenTelemetryModule_1.OpenTelemetryModule.forRoot({
        metricAutoObservers: [HttpRequestDurationSeconds_1.HttpRequestDurationSeconds],
        metricExporter: { export: exporter, shutdown: jest.fn() },
        metricInterval: 100,
        sampler: new core_1.AlwaysOnSampler(),
    });
    beforeEach(() => {
        exporter.mockClear();
        exporter.mockReset();
    });
    it(`should generate http metric`, async () => {
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
        await (0, wait_for_expect_1.default)(() => expect(exporter).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                descriptor: {
                    name: 'http_request_duration_seconds',
                    description: 'http_request_duration_seconds',
                    unit: '1',
                    metricKind: 2,
                    valueType: 1,
                    boundaries: [
                        0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
                    ],
                },
            }),
        ]), expect.any(Function)));
        await app.close();
    });
});
//# sourceMappingURL=HttpRequestDurationIT.js.map