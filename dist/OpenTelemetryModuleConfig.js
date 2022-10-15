"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetryModuleDefaultConfig = void 0;
const ControllerInjector_1 = require("./Trace/Injectors/ControllerInjector");
const GuardInjector_1 = require("./Trace/Injectors/GuardInjector");
const EventEmitterInjector_1 = require("./Trace/Injectors/EventEmitterInjector");
const ScheduleInjector_1 = require("./Trace/Injectors/ScheduleInjector");
const PipeInjector_1 = require("./Trace/Injectors/PipeInjector");
const LoggerInjector_1 = require("./Trace/Injectors/LoggerInjector");
const context_async_hooks_1 = require("@opentelemetry/context-async-hooks");
const resources_1 = require("@opentelemetry/resources");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const core_1 = require("@opentelemetry/core");
const propagator_jaeger_1 = require("@opentelemetry/propagator-jaeger");
const propagator_b3_1 = require("@opentelemetry/propagator-b3");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const resource_detector_alibaba_cloud_1 = require("@opentelemetry/resource-detector-alibaba-cloud");
const resource_detector_aws_1 = require("@opentelemetry/resource-detector-aws");
const resource_detector_container_1 = require("@opentelemetry/resource-detector-container");
const resource_detector_gcp_1 = require("@opentelemetry/resource-detector-gcp");
const resource_detector_instana_1 = require("@opentelemetry/resource-detector-instana");
exports.OpenTelemetryModuleDefaultConfig = {
    serviceName: 'UNKNOWN',
    traceAutoInjectors: [
        ControllerInjector_1.ControllerInjector,
        GuardInjector_1.GuardInjector,
        EventEmitterInjector_1.EventEmitterInjector,
        ScheduleInjector_1.ScheduleInjector,
        PipeInjector_1.PipeInjector,
        LoggerInjector_1.LoggerInjector,
    ],
    autoDetectResources: true,
    resourceDetectors: [
        resource_detector_alibaba_cloud_1.alibabaCloudEcsDetector,
        resource_detector_aws_1.awsEc2Detector,
        resource_detector_container_1.containerDetector,
        resource_detector_gcp_1.gcpDetector,
        resource_detector_instana_1.instanaAgentDetector,
    ],
    contextManager: new context_async_hooks_1.AsyncLocalStorageContextManager(),
    resource: new resources_1.Resource({
        lib: '@metinseylan/nestjs-opentelemetry',
    }),
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
    spanProcessor: new sdk_trace_base_1.NoopSpanProcessor(),
    textMapPropagator: new core_1.CompositePropagator({
        propagators: [
            new propagator_jaeger_1.JaegerPropagator(),
            new propagator_b3_1.B3Propagator(),
            new propagator_b3_1.B3Propagator({
                injectEncoding: propagator_b3_1.B3InjectEncoding.MULTI_HEADER,
            }),
        ],
    }),
};
//# sourceMappingURL=OpenTelemetryModuleConfig.js.map