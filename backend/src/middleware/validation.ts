// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateBody =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formatted = result.error.flatten();

      return res.status(400).json({
        message: "Request body validation failed",
        errors: formatted, // contains fieldErrors & formErrors
      });
    }

    // Use the parsed (and typed) data going forward
    req.body = result.data;
    return next();
  };

export const validateQuery =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const formatted = result.error.flatten();

      return res.status(400).json({
        message: "Query parameter validation failed",
        errors: formatted,
      });
    }

    // Use the parsed (and typed) data going forward
    req.query = result.data as any;
    return next();
  };

export const validateParams =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const formatted = result.error.flatten();

      return res.status(400).json({
        message: "Path parameter validation failed",
        errors: formatted,
      });
    }

    // Use the parsed (and typed) data going forward
    req.params = result.data as any;
    return next();
  };