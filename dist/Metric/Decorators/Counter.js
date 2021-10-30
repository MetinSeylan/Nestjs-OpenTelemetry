"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Counter = void 0;
const common_1 = require("@nestjs/common");
const Constants_1 = require("../../Constants");
const DecoratorType_1 = require("./DecoratorType");
const Counter = (name, options) => (0, common_1.SetMetadata)(Constants_1.Constants.METRIC_METADATA, {
    name,
    options,
    type: DecoratorType_1.DecoratorType.COUNTER,
});
exports.Counter = Counter;
//# sourceMappingURL=Counter.js.map