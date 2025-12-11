import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { validateBody } from "../middleware/validation";
import { createOrderSchema } from "../validation/order.schema";

const router = Router();

// POST /api/orders
router.post(
  "/",
  validateBody(createOrderSchema),  // Zod validation here
  orderController.create
);

export default router;
