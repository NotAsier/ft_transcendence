"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const metrics_process_1 = require("./metrics/metrics.process");
const http_metrics_interceptor_1 = require("./metrics/http-metrics.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: false,
    });
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new http_metrics_interceptor_1.HttpMetricsInterceptor());
    (0, metrics_process_1.startProcessMetrics)();
    await app.listen(3000, '0.0.0.0');
    console.log('APP CREATED');
    console.log('LISTENING 3000');
}
bootstrap();
//# sourceMappingURL=main.js.map