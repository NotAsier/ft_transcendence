"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMetrics = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
const metrics_registry_1 = require("../metrics/metrics.registry");
let GameMetrics = class GameMetrics {
    gamesCreated = new prom_client_1.Counter({
        name: 'games_created_total',
        help: 'Total games created',
        registers: [metrics_registry_1.register],
    });
    gamesStarted = new prom_client_1.Counter({
        name: 'games_started_total',
        help: 'Total games started',
        registers: [metrics_registry_1.register],
    });
    gamesFinished = new prom_client_1.Counter({
        name: 'games_finished_total',
        help: 'Total games finished',
        registers: [metrics_registry_1.register],
    });
    moves = new prom_client_1.Counter({
        name: 'game_moves_total',
        help: 'Total moves made',
        registers: [metrics_registry_1.register],
    });
    activeGames = new prom_client_1.Gauge({
        name: 'games_active',
        help: 'Active games',
        registers: [metrics_registry_1.register],
    });
    moveLatency = new prom_client_1.Histogram({
        name: 'game_move_latency_seconds',
        help: 'Latency of game moves',
        buckets: [0.01, 0.05, 0.1, 0.3, 1, 2],
        registers: [metrics_registry_1.register],
    });
    incCreated() {
        this.gamesCreated.inc();
    }
    incStarted() {
        this.gamesStarted.inc();
    }
    incFinished() {
        this.gamesFinished.inc();
    }
    incMove() {
        this.moves.inc();
    }
    setActive(value) {
        this.activeGames.set(value);
    }
    observeMoveLatency(value) {
        this.moveLatency.observe(value);
    }
};
exports.GameMetrics = GameMetrics;
exports.GameMetrics = GameMetrics = __decorate([
    (0, common_1.Injectable)()
], GameMetrics);
//# sourceMappingURL=game.metrics.js.map