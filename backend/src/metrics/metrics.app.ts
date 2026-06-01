import { Counter, Gauge } from 'prom-client';
import { register } from './metrics.registry';

/**
 * AUTH
 */
export const authSuccessTotal = new Counter({
  name: 'auth_success_total',
  help: 'Login exitosos',
  registers: [register],
});

export const authFailureTotal = new Counter({
  name: 'auth_failure_total',
  help: 'Login fallidos',
  registers: [register],
});

/**
 * WEBSOCKETS
 */
export const wsConnectionsActive = new Gauge({
  name: 'ws_connections_active',
  help: 'Conexiones WebSocket activas',
  registers: [register],
});

export const wsConnectionsTotal = new Counter({
  name: 'ws_connections_total',
  help: 'Total conexiones WebSocket',
  registers: [register],
});

/**
 * GAME STATE
 */
export const activeMatches = new Gauge({
  name: 'active_matches',
  help: 'Partidas en curso',
  registers: [register],
});

export const finishedMatches = new Counter({
  name: 'matches_finished_total',
  help: 'Partidas finalizadas',
  registers: [register],
});