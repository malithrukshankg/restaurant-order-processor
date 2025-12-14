import { Router } from "express";
import { menuController } from "../controllers/menuController";
import { validateBody } from "../middleware/validation";
import { requireRole } from "../middleware/requireRole";
import { authMiddleware } from "../middleware/auth";


const router = Router();

router.get("/", authMiddleware, requireRole("customer"), menuController.getAll);

export default router;
