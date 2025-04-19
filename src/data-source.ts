import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [process.env.ENITITIES_FOLDER],
  // migrations: ["src/database/migration/**/*.ts"],
  // subscribers: ["src/database/subscriber/**/*.ts"],
});

export function getRepo(entity: any) {
  return AppDataSource.getRepository(entity);
}
