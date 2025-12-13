import { Request, Response } from "express";
import { menuService } from "../services/menuService";
import { GetMenuQuery } from "../validation/menu.schema";

export const menuController = {
  // GET /api/menu - Public endpoint (or authenticated)
  async getAll(req: Request, res: Response) {
    try {
      const filters = req.query as GetMenuQuery;
      const items = await menuService.getAll(filters);
      return res.json(items);
    } catch (error) {
      console.error("Error loading menu:", error);
      return res.status(500).json({ message: "Failed to load menu" });
    }
  },

  // GET /api/menu/:id - Get single menu item
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }

      const item = await menuService.getById(id);
      return res.json(item);
    } catch (error: any) {
      console.error("Error loading menu item:", error);

      if (error.message === "MENU_ITEM_NOT_FOUND") {
        return res.status(404).json({ message: "Menu item not found" });
      }

      return res.status(500).json({ message: "Failed to load menu item" });
    }
  },

  // POST /api/menu - Create menu item (admin only)
  async create(req: Request, res: Response) {
    try {
      const item = await menuService.create(req.body);
      return res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating menu item:", error);

      if (error.message === "BURGER_CANNOT_HAVE_SIZE") {
        return res.status(400).json({ 
          message: "Burgers cannot have a size specified" 
        });
      }

      if (error.message === "DRINK_MUST_HAVE_SIZE") {
        return res.status(400).json({ 
          message: "Drinks must have a size (SMALL or LARGE)" 
        });
      }

      return res.status(500).json({ message: "Failed to create menu item" });
    }
  },

  // PUT /api/menu/:id - Update menu item (admin only)
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }

      const item = await menuService.update(id, req.body);
      return res.json(item);
    } catch (error: any) {
      console.error("Error updating menu item:", error);

      if (error.message === "MENU_ITEM_NOT_FOUND") {
        return res.status(404).json({ message: "Menu item not found" });
      }

      if (error.message === "BURGER_CANNOT_HAVE_SIZE") {
        return res.status(400).json({ 
          message: "Burgers cannot have a size specified" 
        });
      }

      if (error.message === "DRINK_MUST_HAVE_SIZE") {
        return res.status(400).json({ 
          message: "Drinks must have a size (SMALL or LARGE)" 
        });
      }

      return res.status(500).json({ message: "Failed to update menu item" });
    }
  },

  // DELETE /api/menu/:id - Delete menu item (admin only, soft delete)
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }

      await menuService.delete(id);
      return res.json({ message: "Menu item deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting menu item:", error);

      if (error.message === "MENU_ITEM_NOT_FOUND") {
        return res.status(404).json({ message: "Menu item not found" });
      }

      return res.status(500).json({ message: "Failed to delete menu item" });
    }
  },
};