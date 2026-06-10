import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as net from 'net';
import TransportStream = require('winston-transport');

class LogstashTCPTransport extends TransportStream {
  private host: string;
  private port: number;

  constructor(opts: any) {
    super(opts);
    this.host = opts.host || 'logstash';
    this.port = opts.port || 5001;
  }

  log(info: any, callback: () => void) {
    const socket = net.createConnection(this.port, this.host, () => {
      socket.write(JSON.stringify(info) + '\n');
      socket.end();
    });
    socket.on('error', () => {});
    this.emit('logged', info);
    callback();
  }
}

@Injectable()
export class LoggerService {
  private logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new LogstashTCPTransport({ host: 'logstash', port: 5001 }),
    ],
  });

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }
}