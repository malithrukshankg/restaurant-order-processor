import { AppDataSource } from "../data-source";
import { MenuItem } from "../entities/MenuItem";
import { CreateMenuItemInput, UpdateMenuItemInput, GetMenuQuery } from "../validation/menu.schema";

export const menuService = {
  async getAll(filters?: GetMenuQuery) {
    const repo = AppDataSource.getRepository(MenuItem);

    const where: any = {};
    
    // Apply filters if provided
    if (filters?.type) {
      where.type = filters.type;
    }
    
    if (filters?.size !== undefined) {
      where.size = filters.size;
    }
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else {
      // Default to active items only for public endpoint
      where.isActive = true;
    }

    return repo.find({
      where,
      order: { id: "ASC" },
    });
  },

  async getById(id: number) {
    const repo = AppDataSource.getRepository(MenuItem);
    const item = await repo.findOne({ where: { id } });
    
    if (!item) {
      throw new Error("MENU_ITEM_NOT_FOUND");
    }
    
    return item;
  },

  async create(input: CreateMenuItemInput) {
    const repo = AppDataSource.getRepository(MenuItem);

    // Validate size field based on type
    if (input.type === "BURGER" && input.size !== null && input.size !== undefined) {
      throw new Error("BURGER_CANNOT_HAVE_SIZE");
    }

    if (input.type === "DRINK" && !input.size) {
      throw new Error("DRINK_MUST_HAVE_SIZE");
    }

    const menuItem = repo.create(input);
    return repo.save(menuItem);
  },

  async update(id: number, input: UpdateMenuItemInput) {
    const repo = AppDataSource.getRepository(MenuItem);
    
    const existing = await repo.findOne({ where: { id } });
    if (!existing) {
      throw new Error("MENU_ITEM_NOT_FOUND");
    }

    // Validate size field based on type if type is being changed
    const newType = input.type || existing.type;
    const newSize = input.size !== undefined ? input.size : existing.size;

    if (newType === "BURGER" && newSize !== null) {
      throw new Error("BURGER_CANNOT_HAVE_SIZE");
    }

    if (newType === "DRINK" && !newSize) {
      throw new Error("DRINK_MUST_HAVE_SIZE");
    }

    Object.assign(existing, input);
    return repo.save(existing);
  },

  async delete(id: number) {
    const repo = AppDataSource.getRepository(MenuItem);
    
    const existing = await repo.findOne({ where: { id } });
    if (!existing) {
      throw new Error("MENU_ITEM_NOT_FOUND");
    }

    // Soft delete - just mark as inactive
    existing.isActive = false;
    return repo.save(existing);
  },
};