import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { OrderItem } from "./OrderItem";

export type DrinkSize = "SMALL" | "LARGE" | null;
export type MenuItemType = "BURGER" | "DRINK";

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column("real")
  price!: number;

  @Column({ type: "text" })
  type!: MenuItemType;

   @Column({ type: "text", nullable: true })
  size!: DrinkSize;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
  orderItems!: OrderItem[];
}
