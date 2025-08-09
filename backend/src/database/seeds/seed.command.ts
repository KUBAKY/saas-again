import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { SeedService } from './seed.service';

async function runSeed() {
  const logger = new Logger('SeedCommand');
  
  try {
    logger.log('🌱 开始执行数据库种子数据初始化命令...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const seedService = app.get(SeedService);
    
    await seedService.seed();
    
    await app.close();
    logger.log('✅ 数据库种子数据初始化成功完成');
  } catch (error) {
    logger.error('❌ 数据库种子数据初始化失败:', error);
    process.exit(1);
  }
}

runSeed();