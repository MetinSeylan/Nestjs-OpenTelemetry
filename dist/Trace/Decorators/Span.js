"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Span = void 0;
const common_1 = require("@nestjs/common");
const Constants_1 = require("../../Constants");
const Span = (name) => (0, common_1.SetMetadata)(Constants_1.Constants.TRACE_METADATA, name);
exports.Span = Span;
//# sourceMappingURL=Span.js.map