import { Router } from "express";
import { orderController } from "../controllers/orderController";

const router = Router();

// POST /api/orders
router.post("/", orderController.create);

export default router;
