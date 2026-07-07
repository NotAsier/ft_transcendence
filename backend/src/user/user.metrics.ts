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

  private onlineUsers = new Set<number>();

  incCreated() {
    this.usersCreated.inc();
  }

  incLogin() {
    this.userLogins.inc();
  }

  trackOnline(userId: number) {
    this.onlineUsers.add(userId);
    this.usersOnline.set(this.onlineUsers.size);
  }

  untrackOnline(userId: number) {
    this.onlineUsers.delete(userId);
    this.usersOnline.set(this.onlineUsers.size);
  }
}