import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
  } from '@nestjs/common';
  
  import { Observable, tap } from 'rxjs';
  import { Counter, Histogram } from 'prom-client';
  import { register } from './metrics.registry';
  
  const httpRequestsTotal = new Counter({
	name: 'http_requests_total',
	help: 'Total HTTP requests',
	labelNames: ['method', 'route', 'status'],
	registers: [register],
  });
  
  const httpRequestDuration = new Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duración HTTP en segundos',
	labelNames: ['method', 'route', 'status'],
	buckets: [0.1, 0.3, 0.5, 1, 2, 5],
	registers: [register],
  });
  
  @Injectable()
  export class HttpMetricsInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
	  const req = context.switchToHttp().getRequest();
	  const res = context.switchToHttp().getResponse();
  
	  const start = Date.now();
  
	  return next.handle().pipe(
		tap(() => {
		  const duration = (Date.now() - start) / 1000;
  
		  const route = req.route?.path || req.originalUrl;
  
		  const labels = {
			method: req.method,
			route,
			status: String(res.statusCode),
		  };
  
		  httpRequestsTotal.inc(labels);
		  httpRequestDuration.observe(labels, duration);
		}),
	  );
	}
  }