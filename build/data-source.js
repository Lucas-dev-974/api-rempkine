"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.getRepo = getRepo;
require("reflect-metadata");
var typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [process.env.ENTITIES_FOLDER],
    // migrations: ["src/database/migration/**/*.ts"],
    // subscribers: ["src/database/subscriber/**/*.ts"],
});
function getRepo(entity) {
    return exports.AppDataSource.getRepository(entity);
}
//# sourceMappingURL=data-source.js.map