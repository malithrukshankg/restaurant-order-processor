import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { MenuItem } from "../entities/MenuItem";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import {
  CreateOrderInput,
  OrderItemInput,
  OrderReceipt,
  OrderReceiptItem,
} from "../types/order";


const GST_RATE = 0.1;


export const orderService = {
  async createOrder(input: CreateOrderInput): Promise<OrderReceipt> {
    if (!input.items || input.items.length === 0) {
      throw new Error("ORDER_EMPTY");
    }

    const menuRepo = AppDataSource.getRepository(MenuItem);
    const orderRepo = AppDataSource.getRepository(Order);

    const menuItemIds = input.items.map((i) => i.menuItemId);

    const menuItems = await menuRepo.find({
      where: { id: In(menuItemIds), isActive: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new Error("INVALID_MENU_ITEMS");
    }

    const order = new Order();
    order.orderCode = `ORD-${Date.now()}`;
    order.customerName = input.customerName ?? null;
    order.tableNumber = input.tableNumber ?? null;

    let total = 0;
    const orderItems: OrderItem[] = [];
    const receiptItems: OrderReceiptItem[] = [];

    for (const itemInput of input.items) {
      const menuItem = menuItems.find((m) => m.id === itemInput.menuItemId)!;

      const lineTotal = menuItem.price * itemInput.quantity;
      total += lineTotal;

      const orderItem = new OrderItem();
      orderItem.order = order;
      orderItem.menuItem = menuItem;
      orderItem.menuItemId = menuItem.id;
      orderItem.quantity = itemInput.quantity;
      orderItem.unitPrice = menuItem.price;
      orderItems.push(orderItem);

      const displayName =
        menuItem.type === "DRINK" && menuItem.size
          ? `${menuItem.name} (${menuItem.size})`
          : menuItem.name;

      receiptItems.push({
        name: displayName,
        quantity: itemInput.quantity,
        unitPrice: menuItem.price,
        lineTotal,
      });
    }

    order.total = total;
    order.items = orderItems;

    await orderRepo.save(order);

    const gstPortion = total - total / (1 + GST_RATE);

    return {
      orderCode: order.orderCode,
      customerName: order.customerName,
      tableNumber: order.tableNumber,
      total: Number(total.toFixed(2)),
      gst: Number(gstPortion.toFixed(2)),
      items: receiptItems,
    };
  },
};
