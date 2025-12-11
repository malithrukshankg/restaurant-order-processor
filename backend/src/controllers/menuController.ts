import { Request, Response } from "express";
import { menuService } from "../services/menuService";

export const menuController = {
  async getAll(_req: Request, res: Response) {
    try {
      const items = await menuService.getAll();
      return res.json(items);
    } catch (error) {
      console.error("Error loading menu:", error);
      return res.status(500).json({ message: "Failed to load menu" });
    }
  },
};
