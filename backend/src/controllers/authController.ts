import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const userRepo = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const authController = {
  // POST /api/auth/register
  register: async (req: Request, res: Response) => {
    try {
      const { name, phone, email, password } = req.body;

      if (!email || !password || !name || !phone) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const existing = await userRepo.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "User already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = userRepo.create({
        name,
        phone,
        email,
        passwordHash,
        role: "customer", // default role
      });

      await userRepo.save(user);

      return res
        .status(201)
        .json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /api/auth/login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await userRepo.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        token, user: {
          userId: user.id,
          email: user.email,
          role: user.role,
        }
});
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
