import { AppDataSource } from "../data-source";
import { MenuItem } from "../entities/MenuItem";

export const menuService = {
  async getAll() {
    const repo = AppDataSource.getRepository(MenuItem);

    return repo.find({
      where: { isActive: true },
      order: { id: "ASC" },
    });
  },
};
