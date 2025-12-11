import { Router } from "express";
import { menuController } from "../controllers/menuController";

const router = Router();

router.get("/", menuController.getAll);

export default router;
