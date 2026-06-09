"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const prom_client_1 = require("prom-client");
const metrics_registry_1 = require("./metrics.registry");
const httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [metrics_registry_1.register],
});
const httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duración HTTP en segundos',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
    registers: [metrics_registry_1.register],
});
let HttpMetricsInterceptor = class HttpMetricsInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const start = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route?.path || req.originalUrl;
            const labels = {
                method: req.method,
                route,
                status: String(res.statusCode),
            };
            httpRequestsTotal.inc(labels);
            httpRequestDuration.observe(labels, duration);
        }));
    }
};
exports.HttpMetricsInterceptor = HttpMetricsInterceptor;
exports.HttpMetricsInterceptor = HttpMetricsInterceptor = __decorate([
    (0, common_1.Injectable)()
], HttpMetricsInterceptor);
//# sourceMappingURL=http-metrics.interceptor.js.map