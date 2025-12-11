import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { validateBody } from "../middleware/validation";
import { createOrderSchema } from "../validation/order.schema";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// POST /api/orders
router.post(
  "/",
  authMiddleware,
  requireRole("customer"),
  validateBody(createOrderSchema),  // Zod validation here
  orderController.create
);

export default router;
