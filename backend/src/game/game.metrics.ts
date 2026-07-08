import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';
import { register } from '../metrics/metrics.registry';

@Injectable()
export class GameMetrics {
  private readonly gamesCreated = new Counter({
    name: 'games_created_total',
    help: 'Total games created',
    registers: [register],
  });

  private readonly gamesStarted = new Counter({
    name: 'games_started_total',
    help: 'Total games started',
    registers: [register],
  });

  private readonly gamesFinished = new Counter({
    name: 'games_finished_total',
    help: 'Total games finished',
    registers: [register],
  });

  private readonly gamesAbandoned = new Counter({
    name: 'games_abandoned_total',
    help: 'Total games abandoned by disconnect',
    registers: [register],
  });

  private readonly moves = new Counter({
    name: 'game_moves_total',
    help: 'Total moves made',
    registers: [register],
  });

  private readonly activeGames = new Gauge({
    name: 'games_active',
    help: 'Active games',
    registers: [register],
  });

  private readonly moveLatency = new Histogram({
	name: 'game_move_latency_seconds',
	help: 'Latency of game moves',
	buckets: [0.01, 0.05, 0.1, 0.3, 1, 2],
	registers: [register],
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

  incAbandoned() {
    this.gamesAbandoned.inc();
  }

  incMove() {
    this.moves.inc();
  }

  setActive(value: number) {
    this.activeGames.set(value);
  }

  observeMoveLatency(value: number) {
	this.moveLatency.observe(value);
  }
  
}