import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),

  tableNumber: z.string().optional(),

  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive("menuItemId must be positive"),
        quantity: z.number().int().positive("quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
