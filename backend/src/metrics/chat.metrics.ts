import client from 'prom-client';

export const chatMessagesTotal = new client.Counter({
  name: 'chat_messages_total',
  help: 'Total number of chat messages sent',
});

export const chatActiveConnections = new client.Gauge({
  name: 'chat_active_connections',
  help: 'Number of active chat websocket connections',
});