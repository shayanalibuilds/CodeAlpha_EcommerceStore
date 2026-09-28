import { z } from 'zod';
import { CATEGORIES } from '../models/Product.js';

// ---- Auth ----
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(1, 'Name is required.')
    .max(80, 'Keep the name under 80 characters.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .min(1, 'Email is required.')
    .email('Enter a valid email, like name@example.com.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password is too long — use 128 characters or fewer.'),
  // role is accepted but never trusted — register always creates a customer.
  role: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .min(1, 'Email is required.')
    .email('Enter a valid email, like name@example.com.'),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.'),
});

// ---- Products (admin) ----
const categoryValues = [...CATEGORIES];

export const productCreateSchema = z.object({
  title: z
    .string({ required_error: 'Title is required.' })
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(120, 'Keep the title under 120 characters.'),
  description: z
    .string({ required_error: 'Description is required.' })
    .trim()
    .min(10, 'Add a short description (at least 10 characters).')
    .max(2000, 'Keep the description under 2000 characters.'),
  priceCents: z
    .number({ required_error: 'Price is required.', invalid_type_error: 'Price must be a number of cents.' })
    .int('Price must be a whole number of cents.')
    .min(1, 'Price must be at least 1 cent.')
    .max(1000000000, 'Price is too large.'),
  category: z.enum(categoryValues, {
    required_error: 'Pick a category.',
    invalid_type_error: 'Pick a category.',
    message: `Category must be one of: ${categoryValues.join(', ')}.`,
  }),
  imageUrl: z.string().trim().max(500, 'Image URL is too long.').optional().default(''),
  stock: z
    .number({ required_error: 'Stock is required.', invalid_type_error: 'Stock must be a number.' })
    .int('Stock must be a whole number.')
    .min(0, 'Stock cannot be negative.')
    .max(1000000, 'Stock is too large.'),
  archived: z.boolean().optional().default(false),
});

export const productUpdateSchema = productCreateSchema.partial();

// ---- Cart ----
const objectIdString = z
  .string({ required_error: 'Product id is required.' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Use a valid product id.');

export const cartAddSchema = z.object({
  productId: objectIdString,
  qty: z
    .number({ invalid_type_error: 'Quantity must be a number.' })
    .int('Quantity must be a whole number.')
    .min(1, 'Quantity must be at least 1.')
    .max(99, 'Quantity cannot be more than 99.')
    .optional()
    .default(1),
});

export const cartUpdateSchema = z.object({
  qty: z
    .number({ required_error: 'Quantity is required.', invalid_type_error: 'Quantity must be a number.' })
    .int('Quantity must be a whole number.')
    .min(1, 'Quantity must be at least 1.')
    .max(99, 'Quantity cannot be more than 99.'),
});
