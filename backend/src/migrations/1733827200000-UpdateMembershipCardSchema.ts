import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from 'typeorm';

export class UpdateMembershipCardSchema1733827200000
  implements MigrationInterface
{
  name = 'UpdateMembershipCardSchema1733827200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 删除不匹配的字段
    await queryRunner.dropColumn('membership_cards', 'valid_from');
    await queryRunner.dropColumn('membership_cards', 'valid_to');
    await queryRunner.dropColumn('membership_cards', 'purchase_price');

    // 2. 修改type字段为varchar，允许更灵活的卡类型
    await queryRunner.changeColumn(
      'membership_cards',
      'type',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '50',
        comment: '卡类型名称',
      })
    );

    // 3. 添加计费方式字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'billing_type',
        type: 'enum',
        enum: ['times', 'period', 'unlimited'],
        default: "'times'",
        comment: '计费方式',
      })
    );

    // 4. 添加价格字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        comment: '卡片价格',
      })
    );

    // 5. 添加总次数字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'total_sessions',
        type: 'int',
        isNullable: true,
        comment: '总次数（次卡）',
      })
    );

    // 6. 添加已使用次数字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'used_sessions',
        type: 'int',
        default: 0,
        comment: '已使用次数',
      })
    );

    // 7. 添加有效期天数字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'validity_days',
        type: 'int',
        isNullable: true,
        comment: '有效期（天数）',
      })
    );

    // 8. 添加开卡日期字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'issue_date',
        type: 'date',
        comment: '开卡日期',
      })
    );

    // 9. 添加到期日期字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'expiry_date',
        type: 'date',
        isNullable: true,
        comment: '到期日期',
      })
    );

    // 10. 添加激活日期字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'activation_date',
        type: 'date',
        isNullable: true,
        comment: '激活日期',
      })
    );

    // 11. 修改status字段的枚举值
    await queryRunner.changeColumn(
      'membership_cards',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive', 'expired', 'frozen', 'refunded'],
        default: "'inactive'",
        comment: '卡状态',
      })
    );

    // 12. 添加备注字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'notes',
        type: 'text',
        isNullable: true,
        comment: '备注信息',
      })
    );

    // 13. 添加卡片配置字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'settings',
        type: 'jsonb',
        isNullable: true,
        comment: '卡片配置',
      })
    );

    // 14. 添加brand_id字段支持多租户
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'brand_id',
        type: 'uuid',
        comment: '品牌ID',
      })
    );

    // 15. 添加deleted_at字段支持软删除
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
        comment: '删除时间',
      })
    );

    // 16. 创建brand_id外键
    await queryRunner.query(`
      ALTER TABLE membership_cards
      ADD CONSTRAINT FK_membership_cards_brand_id
      FOREIGN KEY (brand_id) REFERENCES brands(id)
      ON DELETE CASCADE;
    `);

    // 17. 创建复合索引优化查询
    await queryRunner.query(`
      CREATE INDEX IDX_membership_cards_brand_store_status 
      ON membership_cards (brand_id, store_id, status);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_membership_cards_member_active 
      ON membership_cards (member_id, status) 
      WHERE deleted_at IS NULL;
    `);

    // 18. 更新卡号生成函数以包含品牌信息
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_membership_card_number(store_prefix VARCHAR(10), brand_prefix VARCHAR(5))
      RETURNS VARCHAR(50) AS $$
      DECLARE
        card_number VARCHAR(50);
        counter INTEGER;
      BEGIN
        -- 获取当前门店的会籍卡数量
        SELECT COUNT(*) + 1 INTO counter
        FROM membership_cards mc
        JOIN stores s ON mc.store_id = s.id
        WHERE s.code = store_prefix AND mc.deleted_at IS NULL;
        
        -- 生成卡号：品牌代码 + 门店代码 + MC + 6位数字
        card_number := brand_prefix || store_prefix || 'MC' || LPAD(counter::TEXT, 6, '0');
        
        RETURN card_number;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 19. 更新触发器
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION auto_generate_membership_card_number()
      RETURNS TRIGGER AS $$
      DECLARE
        store_code VARCHAR(10);
        brand_code VARCHAR(5);
      BEGIN
        -- 如果没有提供卡号，自动生成
        IF NEW.card_number IS NULL OR NEW.card_number = '' THEN
          -- 获取门店和品牌代码
          SELECT s.code, b.code INTO store_code, brand_code 
          FROM stores s 
          JOIN brands b ON s.brand_id = b.id 
          WHERE s.id = NEW.store_id;
          
          -- 生成卡号
          NEW.card_number := generate_membership_card_number(store_code, brand_code);
        END IF;
        
        -- 设置品牌ID
        IF NEW.brand_id IS NULL THEN
          SELECT brand_id INTO NEW.brand_id FROM stores WHERE id = NEW.store_id;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除新添加的字段和索引
    await queryRunner.dropIndex('membership_cards', 'IDX_membership_cards_brand_store_status');
    await queryRunner.dropIndex('membership_cards', 'IDX_membership_cards_member_active');
    
    await queryRunner.query('ALTER TABLE membership_cards DROP CONSTRAINT FK_membership_cards_brand_id');
    
    await queryRunner.dropColumn('membership_cards', 'deleted_at');
    await queryRunner.dropColumn('membership_cards', 'brand_id');
    await queryRunner.dropColumn('membership_cards', 'settings');
    await queryRunner.dropColumn('membership_cards', 'notes');
    await queryRunner.dropColumn('membership_cards', 'activation_date');
    await queryRunner.dropColumn('membership_cards', 'expiry_date');
    await queryRunner.dropColumn('membership_cards', 'issue_date');
    await queryRunner.dropColumn('membership_cards', 'validity_days');
    await queryRunner.dropColumn('membership_cards', 'used_sessions');
    await queryRunner.dropColumn('membership_cards', 'total_sessions');
    await queryRunner.dropColumn('membership_cards', 'price');
    await queryRunner.dropColumn('membership_cards', 'billing_type');

    // 恢复原始字段
    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'valid_from',
        type: 'timestamp',
        comment: '生效时间',
      })
    );

    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'valid_to',
        type: 'timestamp',
        comment: '失效时间',
      })
    );

    await queryRunner.addColumn(
      'membership_cards',
      new TableColumn({
        name: 'purchase_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        comment: '购买价格',
      })
    );
  }
}