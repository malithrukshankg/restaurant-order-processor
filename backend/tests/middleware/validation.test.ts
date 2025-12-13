import { Request, Response, NextFunction } from "express";
import { validateBody, validateQuery, validateParams } from "../../src/middleware/validation";
import { z } from "zod";

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateBody", () => {
    const testSchema = z.object({
      name: z.string().min(1, "Name is required"),
      age: z.number().positive("Age must be positive"),
      email: z.string().email("Invalid email format"),
    });

    it("should call next() with valid body data", () => {
      mockRequest.body = {
        name: "John Doe",
        age: 30,
        email: "john@example.com",
      };

      const middleware = validateBody(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 400 with validation errors for invalid data", () => {
      mockRequest.body = {
        name: "",
        age: -5,
        email: "invalid-email",
      };

      const middleware = validateBody(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Request body validation failed",
        errors: expect.objectContaining({
          fieldErrors: expect.any(Object),
        }),
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 400 with missing required fields", () => {
      mockRequest.body = {
        name: "John",
      };

      const middleware = validateBody(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should transform and use parsed data", () => {
      const transformSchema = z.object({
        price: z.number().transform((val) => val * 1.1), // Add 10%
      });

      mockRequest.body = {
        price: 100,
      };

      const middleware = validateBody(transformSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Use toBeCloseTo for floating point comparison
      expect(mockRequest.body.price).toBeCloseTo(110, 5);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe("validateQuery", () => {
    const querySchema = z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
      type: z.enum(["BURGER", "DRINK"]).optional(),
    });

    it("should call next() with valid query parameters", () => {
      mockRequest.query = {
        page: "2",
        limit: "20",
        type: "BURGER",
      };

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.query).toEqual({
        page: 2,
        limit: 20,
        type: "BURGER",
      });
    });

    it("should return 400 for invalid enum value", () => {
      mockRequest.query = {
        type: "INVALID_TYPE",
      };

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Query parameter validation failed",
        errors: expect.any(Object),
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should handle optional query parameters", () => {
      mockRequest.query = {};

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.query).toEqual({
        page: 1,
        limit: 10,
      });
    });
  });

  describe("validateParams", () => {
    const paramsSchema = z.object({
      id: z.string().refine((val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0;
      }, { message: "Invalid ID" }).transform((val) => parseInt(val, 10)),
    });

    it("should call next() with valid params", () => {
      mockRequest.params = {
        id: "123",
      };

      const middleware = validateParams(paramsSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.params).toEqual({
        id: 123,
      });
    });

    it("should return 400 for invalid param format", () => {
      mockRequest.params = {
        id: "abc",
      };

      const middleware = validateParams(paramsSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Path parameter validation failed",
        errors: expect.any(Object),
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 400 for negative ID", () => {
      mockRequest.params = {
        id: "-5",
      };

      const middleware = validateParams(paramsSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("complex validation scenarios", () => {
    it("should handle nested object validation", () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          contact: z.object({
            email: z.string().email(),
            phone: z.string(),
          }),
        }),
      });

      mockRequest.body = {
        user: {
          name: "John",
          contact: {
            email: "john@example.com",
            phone: "1234567890",
          },
        },
      };

      const middleware = validateBody(nestedSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it("should handle array validation", () => {
      const arraySchema = z.object({
        items: z
          .array(
            z.object({
              menuItemId: z.number(),
              quantity: z.number().positive(),
            })
          )
          .min(1, "At least one item required"),
      });

      mockRequest.body = {
        items: [
          { menuItemId: 1, quantity: 2 },
          { menuItemId: 2, quantity: 1 },
        ],
      };

      const middleware = validateBody(arraySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it("should reject empty array when min is set", () => {
      const arraySchema = z.object({
        items: z.array(z.object({ id: z.number() })).min(1),
      });

      mockRequest.body = {
        items: [],
      };

      const middleware = validateBody(arraySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});