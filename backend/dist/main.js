"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const swagger_config_1 = require("./config/swagger.config");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
    });
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: configService.get('CORS_ORIGIN')?.split(',') || ['http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
    }));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    if (process.env.NODE_ENV !== 'production') {
        (0, swagger_config_1.setupSwagger)(app);
        logger.log('Swagger documentation is available at /api/docs');
    }
    app.getHttpServer().on('request', (req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
            }));
        }
    });
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📖 Swagger documentation: http://localhost:${port}/api/docs`);
    logger.log(`🏥 Health check: http://localhost:${port}/health`);
}
bootstrap().catch((error) => {
    common_1.Logger.error('❌ Error starting server', error, 'Bootstrap');
    process.exit(1);
});
//# sourceMappingURL=main.js.map