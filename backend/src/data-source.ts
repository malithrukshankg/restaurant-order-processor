import "reflect-metadata";
import { DataSource } from "typeorm";
import { MenuItem } from "./entities/MenuItem";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";
import { User } from "./entities/User";

/**
 * Main TypeORM datasource for the backend.
 * Using SQLite.
 */
export const AppDataSource = new DataSource({
  type: "sqlite",

  // Local SQLite file
  database: process.env.DATABASE_URL || "./dev.db",

  // Auto-sync entity changes to the DB (only for dev)
  synchronize: true,

  logging: false,

  // Register entities here
  entities: [User, MenuItem, Order, OrderItem],
});
