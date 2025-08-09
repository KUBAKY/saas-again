"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizeCoachAndAddMembershipCard1703000000000 = void 0;
const typeorm_1 = require("typeorm");
class OptimizeCoachAndAddMembershipCard1703000000000 {
    name = 'OptimizeCoachAndAddMembershipCard1703000000000';
    async up(queryRunner) {
        await queryRunner.addColumn('coaches', new typeorm_1.TableColumn({
            name: 'specialization_type',
            type: 'enum',
            enum: ['personal', 'group', 'both'],
            default: "'both'",
            comment: '教练专业化类型：personal-私教，group-团课，both-全能',
        }));
        await queryRunner.addColumn('coaches', new typeorm_1.TableColumn({
            name: 'business_settings',
            type: 'jsonb',
            isNullable: true,
            comment: '业务设置：权限配置、专业信息等',
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'membership_cards',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'card_number',
                    type: 'varchar',
                    length: '50',
                    isUnique: true,
                    comment: '会籍卡号',
                },
                {
                    name: 'member_id',
                    type: 'uuid',
                    comment: '会员ID',
                },
                {
                    name: 'store_id',
                    type: 'uuid',
                    comment: '门店ID',
                },
                {
                    name: 'type',
                    type: 'enum',
                    enum: ['basic', 'premium', 'vip'],
                    default: "'basic'",
                    comment: '会籍卡类型',
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['active', 'expired', 'suspended'],
                    default: "'active'",
                    comment: '会籍卡状态',
                },
                {
                    name: 'valid_from',
                    type: 'timestamp',
                    comment: '生效时间',
                },
                {
                    name: 'valid_to',
                    type: 'timestamp',
                    comment: '失效时间',
                },
                {
                    name: 'benefits',
                    type: 'jsonb',
                    comment: '会员权益配置',
                },
                {
                    name: 'purchase_price',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    comment: '购买价格',
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: true,
                    comment: '创建人ID',
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true,
                    comment: '更新人ID',
                },
            ],
            foreignKeys: [
                {
                    columnNames: ['member_id'],
                    referencedTableName: 'members',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                },
                {
                    columnNames: ['store_id'],
                    referencedTableName: 'stores',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                },
                {
                    columnNames: ['created_by'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                },
                {
                    columnNames: ['updated_by'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                },
            ],
            indices: [
                {
                    name: 'IDX_membership_cards_member_id',
                    columnNames: ['member_id'],
                },
                {
                    name: 'IDX_membership_cards_store_id',
                    columnNames: ['store_id'],
                },
                {
                    name: 'IDX_membership_cards_status',
                    columnNames: ['status'],
                },
                {
                    name: 'IDX_membership_cards_valid_period',
                    columnNames: ['valid_from', 'valid_to'],
                },
            ],
        }), true);
        await queryRunner.query(`
      UPDATE coaches 
      SET business_settings = '{
        "canManagePersonalTraining": true,
        "canManageGroupClass": true,
        "maxStudentsPerClass": 20,
        "specialties": [],
        "certifications": []
      }'::jsonb
      WHERE business_settings IS NULL
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_membership_card_number(store_prefix VARCHAR(10))
      RETURNS VARCHAR(50) AS $$
      DECLARE
        card_number VARCHAR(50);
        counter INTEGER;
      BEGIN
        -- 获取当前门店的会籍卡数量
        SELECT COUNT(*) + 1 INTO counter
        FROM membership_cards mc
        JOIN stores s ON mc.store_id = s.id
        WHERE s.code = store_prefix;
        
        -- 生成卡号：门店代码 + MC + 6位数字
        card_number := store_prefix || 'MC' || LPAD(counter::TEXT, 6, '0');
        
        RETURN card_number;
      END;
      $$ LANGUAGE plpgsql;
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION auto_generate_membership_card_number()
      RETURNS TRIGGER AS $$
      DECLARE
        store_code VARCHAR(10);
      BEGIN
        -- 如果没有提供卡号，自动生成
        IF NEW.card_number IS NULL OR NEW.card_number = '' THEN
          -- 获取门店代码
          SELECT code INTO store_code FROM stores WHERE id = NEW.store_id;
          
          -- 生成卡号
          NEW.card_number := generate_membership_card_number(store_code);
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
        await queryRunner.query(`
      CREATE TRIGGER trigger_auto_generate_membership_card_number
      BEFORE INSERT ON membership_cards
      FOR EACH ROW
      EXECUTE FUNCTION auto_generate_membership_card_number();
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TRIGGER IF EXISTS trigger_auto_generate_membership_card_number ON membership_cards');
        await queryRunner.query('DROP FUNCTION IF EXISTS auto_generate_membership_card_number()');
        await queryRunner.query('DROP FUNCTION IF EXISTS generate_membership_card_number(VARCHAR)');
        await queryRunner.dropTable('membership_cards');
        await queryRunner.dropColumn('coaches', 'business_settings');
        await queryRunner.dropColumn('coaches', 'specialization_type');
    }
}
exports.OptimizeCoachAndAddMembershipCard1703000000000 = OptimizeCoachAndAddMembershipCard1703000000000;
//# sourceMappingURL=1703000000000-OptimizeCoachAndAddMembershipCard.js.map