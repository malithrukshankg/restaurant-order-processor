import { Request, Response } from "express";
import { authController } from "../../src/controllers/authController";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock dependencies
jest.mock("../../src/data-source");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserRepo: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      mockRequest.body = {
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
        password: "password123",
      };

      mockUserRepo.findOne.mockResolvedValue(null); // User doesn't exist
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      mockUserRepo.create.mockReturnValue({
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
        passwordHash: "hashedPassword",
        role: "customer",
      });
      mockUserRepo.save.mockResolvedValue({});

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("should return 400 if required fields are missing", async () => {
      mockRequest.body = {
        email: "john@example.com",
        // Missing name, phone, password
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Email and password are required",
      });
    });

    it("should return 409 if user already exists", async () => {
      mockRequest.body = {
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
        password: "password123",
      };

      mockUserRepo.findOne.mockResolvedValue({
        id: 1,
        email: "john@example.com",
      });

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User already exists",
      });
    });

    it("should handle database errors gracefully", async () => {
      mockRequest.body = {
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
        password: "password123",
      };

      mockUserRepo.findOne.mockRejectedValue(new Error("DB Error"));

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("login", () => {
    it("should login user successfully and return JWT token", async () => {
      mockRequest.body = {
        email: "john@example.com",
        password: "password123",
      };

      const mockUser = {
        id: 1,
        email: "john@example.com",
        passwordHash: "hashedPassword",
        role: "customer",
      };

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("mock-jwt-token");

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        token: "mock-jwt-token",
        user: {
          userId: 1,
          email: "john@example.com",
          role: "customer",
        },
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 1,
          email: "john@example.com",
          role: "customer",
        },
        expect.any(String),
        { expiresIn: "1h" }
      );
    });

    it("should return 400 if email or password is missing", async () => {
      mockRequest.body = {
        email: "john@example.com",
        // Missing password
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Email and password are required",
      });
    });

    it("should return 401 if user does not exist", async () => {
      mockRequest.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      mockUserRepo.findOne.mockResolvedValue(null);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });

    it("should return 401 if password is incorrect", async () => {
      mockRequest.body = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        id: 1,
        email: "john@example.com",
        passwordHash: "hashedPassword",
        role: "customer",
      };

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });

    it("should handle database errors during login", async () => {
      mockRequest.body = {
        email: "john@example.com",
        password: "password123",
      };

      mockUserRepo.findOne.mockRejectedValue(new Error("DB Error"));

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});