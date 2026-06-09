"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishedMatches = exports.activeMatches = exports.wsConnectionsTotal = exports.wsConnectionsActive = exports.authFailureTotal = exports.authSuccessTotal = void 0;
const prom_client_1 = require("prom-client");
const metrics_registry_1 = require("./metrics.registry");
exports.authSuccessTotal = new prom_client_1.Counter({
    name: 'auth_success_total',
    help: 'Login exitosos',
    registers: [metrics_registry_1.register],
});
exports.authFailureTotal = new prom_client_1.Counter({
    name: 'auth_failure_total',
    help: 'Login fallidos',
    registers: [metrics_registry_1.register],
});
exports.wsConnectionsActive = new prom_client_1.Gauge({
    name: 'ws_connections_active',
    help: 'Conexiones WebSocket activas',
    registers: [metrics_registry_1.register],
});
exports.wsConnectionsTotal = new prom_client_1.Counter({
    name: 'ws_connections_total',
    help: 'Total conexiones WebSocket',
    registers: [metrics_registry_1.register],
});
exports.activeMatches = new prom_client_1.Gauge({
    name: 'active_matches',
    help: 'Partidas en curso',
    registers: [metrics_registry_1.register],
});
exports.finishedMatches = new prom_client_1.Counter({
    name: 'matches_finished_total',
    help: 'Partidas finalizadas',
    registers: [metrics_registry_1.register],
});
//# sourceMappingURL=metrics.app.js.map