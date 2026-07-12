import { z } from "zod";

// Shared Gmail Validation Schema
export const gmailSchema = z
  .string()
  .min(1, "Email is required.")
  .transform((val) => val.trim().toLowerCase())
  .refine((val) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(val), {
    message: "Please enter a valid Gmail address (example@gmail.com).",
  });

// Shared Password Validation Schema
export const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .min(8, "Password must be at least 8 characters long.");

// Login Validation Schema
export const loginSchema = z.object({
  email: gmailSchema,
  password: passwordSchema,
});

// Register Validation Schema
export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required."),
    email: gmailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
    workspace: z.string().min(1, "Workspace / Company name is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// Forgot Password Validation Schema
export const forgotPasswordSchema = z.object({
  email: gmailSchema,
});

// Reset Password Validation Schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

