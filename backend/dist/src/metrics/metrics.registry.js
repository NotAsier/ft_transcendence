"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const prom_client_1 = require("prom-client");
exports.register = new prom_client_1.Registry();
(0, prom_client_1.collectDefaultMetrics)({ register: exports.register });
//# sourceMappingURL=metrics.registry.js.map