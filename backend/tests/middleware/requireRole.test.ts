import { Response, NextFunction } from "express";
import { requireRole } from "../../src/middleware/requireRole";
import { AuthRequest } from "../../src/middleware/auth";

describe("RequireRole Middleware", () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction = jest.fn();

    // Suppress console.log in tests
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("requireRole('customer')", () => {
    it("should call next() if user has customer role", () => {
      mockRequest.user = {
        userId: 1,
        email: "customer@example.com",
        role: "customer",
      };

      const middleware = requireRole("customer");
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 401 if user is not authenticated", () => {
      mockRequest.user = undefined;

      const middleware = requireRole("customer");
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Unauthorized",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 403 if user has admin role instead of customer", () => {
      mockRequest.user = {
        userId: 1,
        email: "admin@example.com",
        role: "admin",
      };

      const middleware = requireRole("customer");
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Forbidden: insufficient permissions",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("requireRole('admin')", () => {
    it("should call next() if user has admin role", () => {
      mockRequest.user = {
        userId: 1,
        email: "admin@example.com",
        role: "admin",
      };

      const middleware = requireRole("admin");
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 401 if user is not authenticated", () => {
      mockRequest.user = undefined;

      const middleware = requireRole("admin");
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Unauthorized",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 403 if user has customer role instead of admin", () => {
      mockRequest.user = {
        userId: 1,
        email: "customer@example.com",
        role: "customer",
      };

      const middleware = requireRole("admin");
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Forbidden: insufficient permissions",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("role enforcement", () => {
    it("should log the user check", () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockRequest.user = {
        userId: 1,
        email: "test@example.com",
        role: "customer",
      };

      const middleware = requireRole("customer");
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(consoleSpy).toHaveBeenCalledWith(
        "requireRole check. req.user =",
        mockRequest.user
      );
    });
  });
});
