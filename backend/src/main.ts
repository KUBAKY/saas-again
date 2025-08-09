import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService);

  // 设置全局前缀
  app.setGlobalPrefix('api/v1');

  // 启用CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || ['http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 去除未定义的属性
      forbidNonWhitelisted: true, // 如果有未定义属性则抛出错误
      transform: true, // 自动转换类型
      disableErrorMessages: process.env.NODE_ENV === 'production', // 生产环境隐藏详细错误
    }),
  );

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置Swagger文档
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
    logger.log('Swagger documentation is available at /api/docs');
  }

  // 健康检查端点
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

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📖 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`🏥 Health check: http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  Logger.error('❌ Error starting server', error, 'Bootstrap');
  process.exit(1);
});
