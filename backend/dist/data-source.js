"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'gym_user',
    password: process.env.DATABASE_PASSWORD || 'dev_password_123',
    database: process.env.DATABASE_NAME || 'gym_saas_dev',
    entities: [
        entities_1.Brand,
        entities_1.Store,
        entities_1.User,
        entities_1.Role,
        entities_1.Permission,
        entities_1.Member,
        entities_1.Coach,
        entities_1.Course,
        entities_1.CourseSchedule,
        entities_1.MembershipCard,
        entities_1.GroupClassCard,
        entities_1.PersonalTrainingCard,
        entities_1.CheckIn,
        entities_1.Booking,
    ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
});
//# sourceMappingURL=data-source.js.map