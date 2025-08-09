import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('健身房多品牌管理SaaS系统 API')
    .setDescription(
      '健身房多品牌管理SaaS系统的RESTful API文档。' +
        '支持多品牌、多门店的统一管理，包括会员服务、课程管理、教练管理、预约系统等核心功能。',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '请在此处输入JWT token',
        name: 'Authorization',
        in: 'header',
      },
      'bearer',
    )
    .addTag('认证', '用户认证相关接口')
    .addTag('品牌管理', '品牌管理相关接口')
    .addTag('门店管理', '门店管理相关接口')
    .addTag('用户管理', '用户管理相关接口')
    .addTag('会员管理', '会员管理相关接口')
    .addTag('教练管理', '教练管理相关接口')
    .addTag('课程管理', '课程管理相关接口')
    .addTag('预约管理', '预约管理相关接口')
    .addTag('签到管理', '签到管理相关接口')
    .addTag('会员卡管理', '会员卡管理相关接口')
    .addServer('http://localhost:3000', '本地开发环境')
    .addServer('https://api.gym-saas.com', '生产环境')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: '健身房SaaS系统 API文档',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui.min.css',
    ],
  });
}
