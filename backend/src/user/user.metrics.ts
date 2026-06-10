import { Injectable } from '@nestjs/common';
import { Counter, Gauge } from 'prom-client';
import { register } from '../metrics/metrics.registry';

@Injectable()
export class UserMetrics {
  private readonly usersCreated = new Counter({
    name: 'users_created_total',
    help: 'Total users created',
    registers: [register],
  });

  private readonly userLogins = new Counter({
    name: 'user_logins_total',
    help: 'Total user logins',
    registers: [register],
  });

  private readonly usersOnline = new Gauge({
    name: 'users_online',
    help: 'Current online users',
    registers: [register],
  });

  private onlineCount = 0;

  incCreated() {
    this.usersCreated.inc();
  }

  incLogin() {
    this.userLogins.inc();
  }

  incOnline() {
    this.onlineCount++;
    this.usersOnline.set(this.onlineCount);
  }

  decOnline() {
    this.onlineCount--;
    if (this.onlineCount < 0) this.onlineCount = 0;
    this.usersOnline.set(this.onlineCount);
  }

  setOnline(value: number) {
    this.onlineCount = value;
    this.usersOnline.set(value);
  }
}