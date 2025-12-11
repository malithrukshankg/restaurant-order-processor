import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import { CreateOrderInput } from "../types/order";


export const orderController = {
  async create(req: Request, res: Response) {
    try {
      const body = req.body as CreateOrderInput;

      if (!body.items || !Array.isArray(body.items)) {
        return res.status(400).json({ message: "Invalid request body." });
      }

      const receipt = await orderService.createOrder(body);
      return res.status(201).json(receipt);
    } catch (err: any) {
      console.error("Error creating order:", err);

      if (err instanceof Error) {
        if (err.message === "ORDER_EMPTY") {
          return res.status(400).json({
            message: "Order must contain at least one item.",
          });
        }

        if (err.message === "INVALID_MENU_ITEMS") {
          return res.status(400).json({
            message: "One or more menu items are invalid or inactive.",
          });
        }
      }

      return res.status(500).json({ message: "Failed to create order." });
    }
  },
};
