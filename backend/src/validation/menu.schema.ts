import { z } from "zod";

// Schema for getting menu items (query parameters - all come as strings)
export const getMenuSchema = z.object({
  type: z.enum(["BURGER", "DRINK"]).optional(),
  size: z.enum(["SMALL", "LARGE"]).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
});

// Schema for creating a menu item (admin only)
export const createMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  price: z.number().positive("Price must be positive"),
  size: z.enum(["SMALL", "LARGE"]).nullable().optional(),
  isActive: z.boolean().default(true),
  type: z.enum(["BURGER", "DRINK"])
});

// Schema for updating a menu item (admin only)
export const updateMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  price: z.number().positive("Price must be positive").optional(),
  type: z.enum(["BURGER", "DRINK"]).optional(),
  size: z.enum(["SMALL", "LARGE"]).nullable().optional(),
  isActive: z.boolean().optional(),
});

// Schema for menu item ID parameter
export const menuItemIdSchema = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      throw new Error("Invalid menu item ID");
    }
    return num;
  }),
});

export type GetMenuQuery = z.infer<typeof getMenuSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;