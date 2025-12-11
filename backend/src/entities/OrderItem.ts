import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./Order";
import { MenuItem } from "./MenuItem";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @Column()
  orderId!: number;

  @ManyToOne(() => MenuItem, (item) => item.orderItems, { eager: true })
  @JoinColumn({ name: "menuItemId" })
  menuItem!: MenuItem;

  @Column()
  menuItemId!: number;

  @Column()
  quantity!: number;

  @Column("real")
  unitPrice!: number;
}
