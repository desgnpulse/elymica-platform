import { z } from 'zod';

/**
 * Auth Service Type Definitions
 * Based on API-CONTRACT-DOCUMENTATION.md
 */

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['student', 'teacher', 'parent', 'admin', 'super_admin']),
  tenant_id: z.string().uuid().optional(),
  tenant_subdomain: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  created_at: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Tenant schema
export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  subdomain: z.string(),
});

export type Tenant = z.infer<typeof TenantSchema>;

// Login request
export const LoginRequestSchema = z.object({
  tenant_subdomain: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Login response
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.string(),
  user: UserSchema,
  tenant: TenantSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Refresh token request
export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// Refresh token response
export const RefreshTokenResponseSchema = z.object({
  success: z.boolean(),
  access_token: z.string(),
  refresh_token: z.string(),  // New refresh token (rotation)
  token_type: z.literal('Bearer'),
  expires_in: z.string(),
});

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// Get current user response
export const GetMeResponseSchema = z.object({
  success: z.boolean(),
  user: UserSchema,
});

export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;

// Standard API error
export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
