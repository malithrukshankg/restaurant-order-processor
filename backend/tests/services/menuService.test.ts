import { menuService } from "../../src/services/menuService";
import { AppDataSource } from "../../src/data-source";
import { MenuItem } from "../../src/entities/MenuItem";

jest.mock("../../src/data-source");

describe("MenuService", () => {
  let mockMenuRepo: any;

  beforeEach(() => {
    mockMenuRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockMenuRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all active menu items by default", async () => {
      const mockMenuItems = [
        { id: 1, name: "Cheeseburger", type: "BURGER", price: 15, isActive: true },
        { id: 2, name: "Soft drink", type: "DRINK", size: "SMALL", price: 4, isActive: true },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);

      const result = await menuService.getAll();

      expect(mockMenuRepo.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { id: "ASC" },
      });
      expect(result).toEqual(mockMenuItems);
    });

    it("should filter by type when provided", async () => {
      const mockBurgers = [
        { id: 1, name: "Cheeseburger", type: "BURGER", price: 15, isActive: true },
      ];

      mockMenuRepo.find.mockResolvedValue(mockBurgers);

      const result = await menuService.getAll({
          type: "BURGER",
          isActive: undefined
      });

      expect(mockMenuRepo.find).toHaveBeenCalledWith({
        where: { type: "BURGER", isActive: true },
        order: { id: "ASC" },
      });
      expect(result).toEqual(mockBurgers);
    });

    it("should filter by size when provided", async () => {
      const mockSmallDrinks = [
        { id: 1, name: "Soft drink", type: "DRINK", size: "SMALL", price: 4, isActive: true },
      ];

      mockMenuRepo.find.mockResolvedValue(mockSmallDrinks);

      const result = await menuService.getAll({
          size: "SMALL",
          isActive: undefined
      });

      expect(mockMenuRepo.find).toHaveBeenCalledWith({
        where: { size: "SMALL", isActive: true },
        order: { id: "ASC" },
      });
      expect(result).toEqual(mockSmallDrinks);
    });

    it("should include inactive items when isActive is false", async () => {
      const mockInactiveItems = [
        { id: 1, name: "Old Burger", type: "BURGER", price: 10, isActive: false },
      ];

      mockMenuRepo.find.mockResolvedValue(mockInactiveItems);

      const result = await menuService.getAll({ isActive: false });

      expect(mockMenuRepo.find).toHaveBeenCalledWith({
        where: { isActive: false },
        order: { id: "ASC" },
      });
      expect(result).toEqual(mockInactiveItems);
    });
  });

  describe("getById", () => {
    it("should return menu item by id", async () => {
      const mockMenuItem = {
        id: 1,
        name: "Cheeseburger",
        type: "BURGER",
        price: 15,
        isActive: true,
      };

      mockMenuRepo.findOne.mockResolvedValue(mockMenuItem);

      const result = await menuService.getById(1);

      expect(mockMenuRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockMenuItem);
    });

    it("should throw error if menu item not found", async () => {
      mockMenuRepo.findOne.mockResolvedValue(null);

      await expect(menuService.getById(999)).rejects.toThrow("MENU_ITEM_NOT_FOUND");
    });
  });

  describe("create", () => {
    it("should create a burger successfully", async () => {
      const input = {
        name: "Cheeseburger",
        type: "BURGER" as const,
        price: 15,
        size: null,
        isActive: true,
      };

      const mockCreatedItem = { id: 1, ...input };

      mockMenuRepo.create.mockReturnValue(mockCreatedItem);
      mockMenuRepo.save.mockResolvedValue(mockCreatedItem);

      const result = await menuService.create(input);

      expect(mockMenuRepo.create).toHaveBeenCalledWith(input);
      expect(mockMenuRepo.save).toHaveBeenCalledWith(mockCreatedItem);
      expect(result).toEqual(mockCreatedItem);
    });

    it("should create a drink with size successfully", async () => {
      const input = {
        name: "Soft drink",
        type: "DRINK" as const,
        price: 4,
        size: "SMALL" as const,
        isActive: true,
      };

      const mockCreatedItem = { id: 2, ...input };

      mockMenuRepo.create.mockReturnValue(mockCreatedItem);
      mockMenuRepo.save.mockResolvedValue(mockCreatedItem);

      const result = await menuService.create(input);

      expect(result).toEqual(mockCreatedItem);
    });

    it("should throw error if burger has size", async () => {
      const input = {
        name: "Cheeseburger",
        type: "BURGER" as const,
        price: 15,
        size: "SMALL" as const,
        isActive: true,
      };

      await expect(menuService.create(input)).rejects.toThrow("BURGER_CANNOT_HAVE_SIZE");
    });

    it("should throw error if drink does not have size", async () => {
      const input = {
        name: "Soft drink",
        type: "DRINK" as const,
        price: 4,
        size: null,
        isActive: true,
      };

      await expect(menuService.create(input)).rejects.toThrow("DRINK_MUST_HAVE_SIZE");
    });
  });

  describe("update", () => {
    it("should update menu item successfully", async () => {
      const existingItem = {
        id: 1,
        name: "Cheeseburger",
        type: "BURGER" as const,
        price: 15,
        size: null,
        isActive: true,
      };

      const updateInput = {
        price: 18,
      };

      const updatedItem = { ...existingItem, ...updateInput };

      mockMenuRepo.findOne.mockResolvedValue(existingItem);
      mockMenuRepo.save.mockResolvedValue(updatedItem);

      const result = await menuService.update(1, updateInput);

      expect(mockMenuRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockMenuRepo.save).toHaveBeenCalledWith(updatedItem);
      expect(result.price).toBe(18);
    });

    it("should throw error if menu item not found", async () => {
      mockMenuRepo.findOne.mockResolvedValue(null);

      await expect(menuService.update(999, { price: 20 })).rejects.toThrow(
        "MENU_ITEM_NOT_FOUND"
      );
    });

    it("should throw error when changing burger to have size", async () => {
      const existingBurger = {
        id: 1,
        name: "Cheeseburger",
        type: "BURGER" as const,
        price: 15,
        size: null,
        isActive: true,
      };

      mockMenuRepo.findOne.mockResolvedValue(existingBurger);

      await expect(
        menuService.update(1, { size: "LARGE" as const })
      ).rejects.toThrow("BURGER_CANNOT_HAVE_SIZE");
    });

    it("should throw error when removing size from drink", async () => {
      const existingDrink = {
        id: 2,
        name: "Soft drink",
        type: "DRINK" as const,
        price: 4,
        size: "SMALL" as const,
        isActive: true,
      };

      mockMenuRepo.findOne.mockResolvedValue(existingDrink);

      await expect(menuService.update(2, { size: null })).rejects.toThrow(
        "DRINK_MUST_HAVE_SIZE"
      );
    });
  });

  describe("delete", () => {
    it("should soft delete menu item by setting isActive to false", async () => {
      const existingItem = {
        id: 1,
        name: "Cheeseburger",
        type: "BURGER" as const,
        price: 15,
        size: null,
        isActive: true,
      };

      const deletedItem = { ...existingItem, isActive: false };

      mockMenuRepo.findOne.mockResolvedValue(existingItem);
      mockMenuRepo.save.mockResolvedValue(deletedItem);

      const result = await menuService.delete(1);

      expect(result.isActive).toBe(false);
      expect(mockMenuRepo.save).toHaveBeenCalledWith(deletedItem);
    });

    it("should throw error if menu item not found", async () => {
      mockMenuRepo.findOne.mockResolvedValue(null);

      await expect(menuService.delete(999)).rejects.toThrow("MENU_ITEM_NOT_FOUND");
    });
  });
});