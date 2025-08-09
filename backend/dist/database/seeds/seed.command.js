"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("../../app.module");
const seed_service_1 = require("./seed.service");
async function runSeed() {
    const logger = new common_1.Logger('SeedCommand');
    try {
        logger.log('🌱 开始执行数据库种子数据初始化命令...');
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
        const seedService = app.get(seed_service_1.SeedService);
        await seedService.seed();
        await app.close();
        logger.log('✅ 数据库种子数据初始化成功完成');
    }
    catch (error) {
        logger.error('❌ 数据库种子数据初始化失败:', error);
        process.exit(1);
    }
}
runSeed();
//# sourceMappingURL=seed.command.js.map