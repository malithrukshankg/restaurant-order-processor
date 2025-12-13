import { Request, Response, NextFunction } from "express";
import { authMiddleware, AuthRequest } from "../../src/middleware/auth";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("AuthMiddleware", () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
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

  it("should call next() with valid JWT token", () => {
    const mockPayload = {
      userId: 1,
      email: "test@example.com",
      role: "customer" as const,
    };

    mockRequest.headers = {
      authorization: "Bearer valid-token",
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    authMiddleware(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", expect.any(String));
    expect(mockRequest.user).toEqual(mockPayload);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header is missing", () => {
    mockRequest.headers = {};

    authMiddleware(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Missing or invalid Authorization header",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header does not start with 'Bearer '", () => {
    mockRequest.headers = {
      authorization: "InvalidFormat token",
    };

    authMiddleware(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Missing or invalid Authorization header",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    mockRequest.headers = {
      authorization: "Bearer invalid-token",
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token is expired", () => {
    mockRequest.headers = {
      authorization: "Bearer expired-token",
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      const error: any = new Error("Token expired");
      error.name = "TokenExpiredError";
      throw error;
    });

    authMiddleware(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should attach user payload to request object", () => {
    const mockPayload = {
      userId: 42,
      email: "admin@example.com",
      role: "admin" as const,
    };

    mockRequest.headers = {
      authorization: "Bearer admin-token",
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    authMiddleware(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.userId).toBe(42);
    expect(mockRequest.user?.email).toBe("admin@example.com");
    expect(mockRequest.user?.role).toBe("admin");
  });
});
