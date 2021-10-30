"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMetricInjector = void 0;
const Constants_1 = require("../../Constants");
const core_1 = require("@nestjs/core");
const constants_1 = require("@nestjs/common/constants");
class BaseMetricInjector {
    modulesContainer;
    metadataScanner = new core_1.MetadataScanner();
    constructor(modulesContainer) {
        this.modulesContainer = modulesContainer;
    }
    *getControllers() {
        for (const module of this.modulesContainer.values()) {
            for (const controller of module.controllers.values()) {
                if (controller && controller.metatype?.prototype) {
                    yield controller;
                }
            }
        }
    }
    *getProviders() {
        for (const module of this.modulesContainer.values()) {
            for (const provider of module.providers.values()) {
                if (provider && provider.metatype?.prototype) {
                    yield provider;
                }
            }
        }
    }
    isPath(prototype) {
        return Reflect.hasMetadata(constants_1.PATH_METADATA, prototype);
    }
    isAffected(prototype) {
        return Reflect.hasMetadata(Constants_1.Constants.METRIC_METADATA_ACTIVE, prototype);
    }
    isDecorated(prototype) {
        return Reflect.hasMetadata(Constants_1.Constants.METRIC_METADATA, prototype);
    }
    getOptions(prototype) {
        return Reflect.getMetadata(Constants_1.Constants.METRIC_METADATA, prototype) || {};
    }
    reDecorate(source, destination) {
        const keys = Reflect.getMetadataKeys(source);
        for (const key of keys) {
            const meta = Reflect.getMetadata(key, source);
            Reflect.defineMetadata(key, meta, destination);
        }
    }
    wrap(prototype, metric) {
        const method = {
            [prototype.name]: function (...args) {
                const startAt = new Date().getMilliseconds();
                if (prototype.constructor.name === 'AsyncFunction') {
                    return prototype.apply(this, args).finally(() => {
                        metric(new Date().getMilliseconds() - startAt);
                    });
                }
                else {
                    try {
                        return prototype.apply(this, args);
                    }
                    finally {
                        metric(new Date().getMilliseconds() - startAt);
                    }
                }
            },
        }[prototype.name];
        this.reDecorate(prototype, method);
        this.affect(method);
        return method;
    }
    affect(prototype) {
        Reflect.defineMetadata(Constants_1.Constants.METRIC_METADATA_ACTIVE, 1, prototype);
    }
}
exports.BaseMetricInjector = BaseMetricInjector;
//# sourceMappingURL=BaseMetricInjector.js.map