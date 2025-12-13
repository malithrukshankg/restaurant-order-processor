import { orderService } from "../../src/services/orderService";
import { AppDataSource } from "../../src/data-source";
import { MenuItem } from "../../src/entities/MenuItem";
import { Order } from "../../src/entities/Order";
import { CreateOrderInput } from "../../src/types/order";

jest.mock("../../src/data-source");

describe("OrderService", () => {
  let mockMenuRepo: any;
  let mockOrderRepo: any;

  beforeEach(() => {
    mockMenuRepo = {
      find: jest.fn(),
    };

    mockOrderRepo = {
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === MenuItem) return mockMenuRepo;
      if (entity === Order) return mockOrderRepo;
      return null;
    });

    // Mock Date.now for consistent order codes
    jest.spyOn(Date, "now").mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("createOrder", () => {
    it("should create an order successfully with single item", async () => {
      const input: CreateOrderInput = {
        customerName: "John Doe",
        tableNumber: "5",
        items: [{ menuItemId: 1, quantity: 2 }],
      };

      const mockMenuItems = [
        {
          id: 1,
          name: "Cheeseburger",
          type: "BURGER",
          price: 15,
          size: null,
          isActive: true,
        },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);
      mockOrderRepo.save.mockImplementation((order: any) => Promise.resolve(order));

      const result = await orderService.createOrder(input);

      expect(result).toMatchObject({
        orderCode: "ORD-1234567890",
        customerName: "John Doe",
        tableNumber: "5",
        total: 30, // 15 * 2
        gst: 2.73, // GST calculation
        items: [
          {
            name: "Cheeseburger",
            quantity: 2,
            unitPrice: 15,
            lineTotal: 30,
          },
        ],
      });
    });

    it("should create an order with multiple items", async () => {
      const input: CreateOrderInput = {
        customerName: "Jane Smith",
        tableNumber: "3",
        items: [
          { menuItemId: 1, quantity: 1 },
          { menuItemId: 2, quantity: 2 },
        ],
      };

      const mockMenuItems = [
        {
          id: 1,
          name: "Cheeseburger",
          type: "BURGER",
          price: 15,
          size: null,
          isActive: true,
        },
        {
          id: 2,
          name: "Soft drink",
          type: "DRINK",
          price: 4,
          size: "SMALL",
          isActive: true,
        },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);
      mockOrderRepo.save.mockImplementation((order: any) => Promise.resolve(order));

      const result = await orderService.createOrder(input);

      expect(result).toMatchObject({
        orderCode: "ORD-1234567890",
        customerName: "Jane Smith",
        tableNumber: "3",
        total: 23, // 15 + (4 * 2)
        items: expect.arrayContaining([
          expect.objectContaining({ name: "Cheeseburger", quantity: 1 }),
          expect.objectContaining({ name: "Soft drink (SMALL)", quantity: 2 }),
        ]),
      });
    });

    it("should format drink names with size", async () => {
      const input: CreateOrderInput = {
        customerName: "Bob",
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      const mockMenuItems = [
        {
          id: 1,
          name: "Soft drink",
          type: "DRINK",
          price: 5,
          size: "LARGE",
          isActive: true,
        },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);
      mockOrderRepo.save.mockImplementation((order: any) => Promise.resolve(order));

      const result = await orderService.createOrder(input);

      expect(result.items[0].name).toBe("Soft drink (LARGE)");
    });

    it("should calculate GST correctly", async () => {
      const input: CreateOrderInput = {
        customerName: "Test User",
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      const mockMenuItems = [
        {
          id: 1,
          name: "Cheeseburger",
          type: "BURGER",
          price: 11, // Using 11 for easier GST calculation
          size: null,
          isActive: true,
        },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);
      mockOrderRepo.save.mockImplementation((order: any) => Promise.resolve(order));

      const result = await orderService.createOrder(input);

      // Total = 11, GST = 11 - (11 / 1.1) = 1
      expect(result.total).toBe(11);
      expect(result.gst).toBe(1);
    });

    it("should handle null customerName and tableNumber", async () => {
      const input: CreateOrderInput = {
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      const mockMenuItems = [
        {
          id: 1,
          name: "Cheeseburger",
          type: "BURGER",
          price: 15,
          size: null,
          isActive: true,
        },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);
      mockOrderRepo.save.mockImplementation((order: any) => Promise.resolve(order));

      const result = await orderService.createOrder(input);

      expect(result.customerName).toBeNull();
      expect(result.tableNumber).toBeNull();
    });

    it("should throw error if items array is empty", async () => {
      const input: CreateOrderInput = {
        customerName: "John Doe",
        items: [],
      };

      await expect(orderService.createOrder(input)).rejects.toThrow("ORDER_EMPTY");
    });

    it("should throw error if items is not provided", async () => {
      const input = {
        customerName: "John Doe",
      } as CreateOrderInput;

      await expect(orderService.createOrder(input)).rejects.toThrow("ORDER_EMPTY");
    });

    it("should throw error if menu items are invalid", async () => {
      const input: CreateOrderInput = {
        customerName: "John Doe",
        items: [
          { menuItemId: 1, quantity: 1 },
          { menuItemId: 999, quantity: 1 }, // Invalid ID
        ],
      };

      const mockMenuItems = [
        {
          id: 1,
          name: "Cheeseburger",
          type: "BURGER",
          price: 15,
          size: null,
          isActive: true,
        },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);

      await expect(orderService.createOrder(input)).rejects.toThrow(
        "INVALID_MENU_ITEMS"
      );
    });

    it("should throw error if menu items are inactive", async () => {
      const input: CreateOrderInput = {
        customerName: "John Doe",
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      // Menu repo returns empty array because item is not active
      mockMenuRepo.find.mockResolvedValue([]);

      await expect(orderService.createOrder(input)).rejects.toThrow(
        "INVALID_MENU_ITEMS"
      );
    });

    it("should calculate correct totals with multiple quantities", async () => {
      const input: CreateOrderInput = {
        customerName: "Test",
        items: [
          { menuItemId: 1, quantity: 3 },
          { menuItemId: 2, quantity: 2 },
        ],
      };

      const mockMenuItems = [
        {
          id: 1,
          name: "Burger",
          type: "BURGER",
          price: 10,
          size: null,
          isActive: true,
        },
        {
          id: 2,
          name: "Drink",
          type: "DRINK",
          price: 5,
          size: "SMALL",
          isActive: true,
        },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);
      mockOrderRepo.save.mockImplementation((order: any) => Promise.resolve(order));

      const result = await orderService.createOrder(input);

      expect(result.total).toBe(40); // (10 * 3) + (5 * 2) = 40
      expect(result.items).toHaveLength(2);
      expect(result.items[0].lineTotal).toBe(30); // 10 * 3
      expect(result.items[1].lineTotal).toBe(10); // 5 * 2
    });

    it("should generate unique order codes", async () => {
      const input: CreateOrderInput = {
        customerName: "Test",
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      const mockMenuItems = [
        {
          id: 1,
          name: "Burger",
          type: "BURGER",
          price: 10,
          size: null,
          isActive: true,
        },
      ];

      mockMenuRepo.find.mockResolvedValue(mockMenuItems);
      mockOrderRepo.save.mockImplementation((order: any) => Promise.resolve(order));

      const result = await orderService.createOrder(input);

      expect(result.orderCode).toMatch(/^ORD-\d+$/);
      expect(result.orderCode).toBe("ORD-1234567890");
    });
  });
});