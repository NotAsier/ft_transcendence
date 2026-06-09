"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatActiveConnections = exports.chatMessagesTotal = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
exports.chatMessagesTotal = new prom_client_1.default.Counter({
    name: 'chat_messages_total',
    help: 'Total number of chat messages sent',
});
exports.chatActiveConnections = new prom_client_1.default.Gauge({
    name: 'chat_active_connections',
    help: 'Number of active chat websocket connections',
});
//# sourceMappingURL=chat.metrics.js.map