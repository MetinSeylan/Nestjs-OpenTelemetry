"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopMetricExporter = void 0;
class NoopMetricExporter {
    export(metrics, resultCallback) {
    }
    shutdown() {
        return Promise.resolve(undefined);
    }
}
exports.NoopMetricExporter = NoopMetricExporter;
//# sourceMappingURL=NoopMetricExporter.js.map