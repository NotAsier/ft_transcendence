"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    console.log('BOOTSTRAP START');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log('APP CREATED');
    await app.listen(3000);
    console.log('LISTENING 3000');
}
bootstrap();
//# sourceMappingURL=main.js.map