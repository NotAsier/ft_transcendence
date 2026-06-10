import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { register } from '../metrics/metrics.registry';

@Injectable()
export class ChatMetrics {
  private readonly connections = new Counter({
    name: 'chat_connections_total',
    help: 'Total chat connections',
    registers: [register],
  });

  private readonly disconnects = new Counter({
    name: 'chat_disconnects_total',
    help: 'Total chat disconnects',
    registers: [register],
  });

  private readonly channelMessages = new Counter({
    name: 'chat_channel_messages_total',
    help: 'Total channel messages',
    registers: [register],
  });

  private readonly directMessages = new Counter({
    name: 'chat_direct_messages_total',
    help: 'Total direct messages',
    registers: [register],
  });

  private readonly historyRequests = new Counter({
    name: 'chat_history_requests_total',
    help: 'Total history requests',
    registers: [register],
  });

  private readonly latency = new Histogram({
    name: 'chat_message_latency_seconds',
    help: 'Chat message latency',
    buckets: [0.01, 0.05, 0.1, 0.3, 1, 2],
    registers: [register],
  });

  incConnections() {
    this.connections.inc();
  }

  incDisconnects() {
    this.disconnects.inc();
  }

  incChannelMessages() {
    this.channelMessages.inc();
  }

  incDirectMessages() {
    this.directMessages.inc();
  }

  incHistoryRequests() {
    this.historyRequests.inc();
  }

  observeLatency(ms: number) {
    this.latency.observe(ms / 1000);
  }

  getMetrics() {
    return register.metrics();
  }
}