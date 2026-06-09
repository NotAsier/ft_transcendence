"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventLoopLagGauge = exports.memoryRssGauge = exports.processUptimeGauge = void 0;
exports.startProcessMetrics = startProcessMetrics;
const prom_client_1 = require("prom-client");
const perf_hooks_1 = require("perf_hooks");
exports.processUptimeGauge = new prom_client_1.Gauge({
    name: 'process_uptime_seconds',
    help: 'Uptime del proceso Node.js',
});
exports.memoryRssGauge = new prom_client_1.Gauge({
    name: 'nodejs_memory_rss_bytes',
    help: 'RSS memory del proceso',
});
const histogram = (0, perf_hooks_1.monitorEventLoopDelay)();
histogram.enable();
exports.eventLoopLagGauge = new prom_client_1.Gauge({
    name: 'eventloop_lag_seconds_custom',
    help: 'Lag del event loop en segundos',
});
function startProcessMetrics() {
    setInterval(() => {
        exports.processUptimeGauge.set(process.uptime());
        exports.memoryRssGauge.set(process.memoryUsage().rss);
        exports.eventLoopLagGauge.set(histogram.mean / 1e9);
    }, 5000);
}
//# sourceMappingURL=metrics.process.js.map