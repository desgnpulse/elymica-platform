import { AxiosInstance } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetMeResponse,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  GetMeResponseSchema,
} from '../types/auth';

/**
 * Auth Service API Client
 * Wraps authentication endpoints with type safety
 */
export class AuthService {
  constructor(private client: AxiosInstance) {}

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await this.client.post('/api/auth/login', credentials);
    return LoginResponseSchema.parse(data);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { data } = await this.client.post('/api/auth/refresh', request);
    return RefreshTokenResponseSchema.parse(data);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<GetMeResponse> {
    const { data } = await this.client.get('/api/auth/me');
    return GetMeResponseSchema.parse(data);
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout(refreshToken?: string): Promise<void> {
    await this.client.post('/api/auth/logout', {
      refresh_token: refreshToken,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string, tenantSubdomain: string): Promise<void> {
    await this.client.post('/api/auth/request-password-reset', {
      email,
      tenant_subdomain: tenantSubdomain,
    });
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.client.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  /**
   * Request OTP for phone verification
   */
  async requestOTP(phoneNumber: string, tenantSubdomain: string): Promise<void> {
    await this.client.post('/api/auth/request-otp', {
      phone_number: phoneNumber,
      tenant_subdomain: tenantSubdomain,
    });
  }

  /**
   * Login with OTP (passwordless)
   */
  async loginWithOTP(
    phoneNumber: string,
    otp: string,
    tenantSubdomain: string
  ): Promise<LoginResponse> {
    const { data } = await this.client.post('/api/auth/login-with-otp', {
      phone_number: phoneNumber,
      otp,
      tenant_subdomain: tenantSubdomain,
    });
    return LoginResponseSchema.parse(data);
  }
}
