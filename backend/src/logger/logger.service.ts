import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as LogstashTransport from 'winston-logstash-transport';

@Injectable()
export class LoggerService {
  private logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new LogstashTransport({
        port: 5000,
        host: 'logstash',
      }),
    ],
  });

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }
}

/* import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import LogstashTransport from 'winston-logstash-transport';

  @Injectable()
  export class LoggerService {
	private logger = winston.createLogger({
	  format: winston.format.json(),
	  transports: [
		new winston.transports.Console(),
		new LogstashTransport({
		  port: 5001,
		  host: 'logstash',
		}),
	  ],
	});
  
	log(event: string, meta: any = {}) {
	  this.logger.info({ event, ...meta });
	}
  
	error(event: string, meta: any = {}) {
	  this.logger.error({ event, ...meta });
	}
  } */

