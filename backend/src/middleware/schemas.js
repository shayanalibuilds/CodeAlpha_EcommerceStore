import { z } from 'zod';

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
