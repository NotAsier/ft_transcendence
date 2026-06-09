import { Counter, Gauge } from 'prom-client';
export declare const authSuccessTotal: Counter<string>;
export declare const authFailureTotal: Counter<string>;
export declare const wsConnectionsActive: Gauge<string>;
export declare const wsConnectionsTotal: Counter<string>;
export declare const activeMatches: Gauge<string>;
export declare const finishedMatches: Counter<string>;
