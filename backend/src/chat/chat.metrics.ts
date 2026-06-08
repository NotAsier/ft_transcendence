import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class ChatMetrics {
  private readonly registry = new Registry();

  private connections = new Counter({
    name: 'chat_connections_total',
    help: 'Total chat connections',
    registers: [this.registry],
  });

  private disconnects = new Counter({
    name: 'chat_disconnects_total',
    help: 'Total chat disconnects',
    registers: [this.registry],
  });

  private channelMessages = new Counter({
    name: 'chat_channel_messages_total',
    help: 'Total channel messages',
    registers: [this.registry],
  });

  private directMessages = new Counter({
    name: 'chat_direct_messages_total',
    help: 'Total direct messages',
    registers: [this.registry],
  });

  private historyRequests = new Counter({
    name: 'chat_history_requests_total',
    help: 'Total history requests',
    registers: [this.registry],
  });

  private latency = new Histogram({
    name: 'chat_message_latency_seconds',
    help: 'Chat message latency',
    buckets: [0.01, 0.05, 0.1, 0.3, 1, 2],
    registers: [this.registry],
  });

  incConnections() {
	console.log('[METRICS] connection');
    this.connections.inc();
  }

  incDisconnects() {
    this.disconnects.inc();
  }

  incChannelMessages() {
	console.log('[METRICS] channel message');
    this.channelMessages.inc();
  }

  incDirectMessages() {
	console.log('[METRICS] direct message');
    this.directMessages.inc();
  }

  incHistoryRequests() {
    this.historyRequests.inc();
  }

  observeLatency(ms: number) {
    this.latency.observe(ms / 1000);
  }

  getMetrics() {
    return this.registry.metrics();
  }
}