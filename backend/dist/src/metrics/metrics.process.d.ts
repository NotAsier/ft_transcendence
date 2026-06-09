import { Gauge } from 'prom-client';
export declare const processUptimeGauge: Gauge<string>;
export declare const memoryRssGauge: Gauge<string>;
export declare const eventLoopLagGauge: Gauge<string>;
export declare function startProcessMetrics(): void;
