import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
  } from '@nestjs/common';
  import { Observable, tap } from 'rxjs';
  import { LoggerService } from './logger.service';
  
  @Injectable()
  export class UserActivityInterceptor implements NestInterceptor {
	constructor(private readonly logger: LoggerService) {}
  
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
	  const req = context.switchToHttp().getRequest();
	  const start = Date.now();
  
	  return next.handle().pipe(
		tap(() => {
		  this.logger.log('user_activity', {
			userId: req.user?.id,
			username: req.user?.username,
			method: req.method,
			url: req.originalUrl,
			ip: req.ip,
			duration: Date.now() - start,
			status: req.res?.statusCode,
		  });
		}),
	  );
	}
  }