import { Gauge } from 'prom-client';
import { monitorEventLoopDelay } from 'perf_hooks';

export const processUptimeGauge = new Gauge({
  name: 'process_uptime_seconds',
  help: 'Uptime del proceso Node.js',
});

export const memoryRssGauge = new Gauge({
  name: 'nodejs_memory_rss_bytes',
  help: 'RSS memory del proceso',
});

const histogram = monitorEventLoopDelay();
histogram.enable();

export const eventLoopLagGauge = new Gauge({
  name: 'eventloop_lag_seconds_custom',
  help: 'Lag del event loop en segundos',
});

export function startProcessMetrics() {
  setInterval(() => {
    processUptimeGauge.set(process.uptime());
    memoryRssGauge.set(process.memoryUsage().rss);
    eventLoopLagGauge.set(histogram.mean / 1e9);
  }, 5000);
}