import { Registry, collectDefaultMetrics } from 'prom-client';


export const register = new Registry();

// métricas base de Node (CPU, GC, heap, etc.)
collectDefaultMetrics({ register });