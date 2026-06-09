"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivityInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const logger_service_1 = require("./logger.service");
let UserActivityInterceptor = class UserActivityInterceptor {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const start = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            this.logger.log('user_activity', {
                userId: req.user?.id,
                username: req.user?.username,
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                duration: Date.now() - start,
                status: req.res?.statusCode,
            });
        }));
    }
};
exports.UserActivityInterceptor = UserActivityInterceptor;
exports.UserActivityInterceptor = UserActivityInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], UserActivityInterceptor);
//# sourceMappingURL=user-activity.interceptor.js.map