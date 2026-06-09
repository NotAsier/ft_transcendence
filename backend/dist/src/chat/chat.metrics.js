"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMetrics = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let ChatMetrics = class ChatMetrics {
    registry = new prom_client_1.Registry();
    connections = new prom_client_1.Counter({
        name: 'chat_connections_total',
        help: 'Total chat connections',
        registers: [this.registry],
    });
    disconnects = new prom_client_1.Counter({
        name: 'chat_disconnects_total',
        help: 'Total chat disconnects',
        registers: [this.registry],
    });
    channelMessages = new prom_client_1.Counter({
        name: 'chat_channel_messages_total',
        help: 'Total channel messages',
        registers: [this.registry],
    });
    directMessages = new prom_client_1.Counter({
        name: 'chat_direct_messages_total',
        help: 'Total direct messages',
        registers: [this.registry],
    });
    historyRequests = new prom_client_1.Counter({
        name: 'chat_history_requests_total',
        help: 'Total history requests',
        registers: [this.registry],
    });
    latency = new prom_client_1.Histogram({
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
    observeLatency(ms) {
        this.latency.observe(ms / 1000);
    }
    getMetrics() {
        return this.registry.metrics();
    }
};
exports.ChatMetrics = ChatMetrics;
exports.ChatMetrics = ChatMetrics = __decorate([
    (0, common_1.Injectable)()
], ChatMetrics);
//# sourceMappingURL=chat.metrics.js.map