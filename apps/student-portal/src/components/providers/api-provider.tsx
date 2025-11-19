'use client';

import { createContext, useContext, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  createApiClient,
  AuthService,
  LMSService,
  NotificationService,
  AssignmentService,
  GradingService,
} from '@elymica/api-client';

interface ApiServices {
  authService: AuthService;
  lmsService: LMSService;
  notificationService: NotificationService;
  assignmentService: AssignmentService;
  gradingService: GradingService;
}

const ApiContext = createContext<ApiServices | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const services = useMemo(() => {
    const apiClient = createApiClient({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.elymica.com',
      getAccessToken: () => session?.accessToken || null,
      getRefreshToken: () => session?.refreshToken || null,
      getTenantId: () => session?.tenantId || null,
      onTokenRefresh: () => {
        // NextAuth handles token refresh automatically in the JWT callback
        // This callback is for the API client's internal retry logic
        console.log('Token refreshed by API client');
      },
      onAuthError: () => {
        // Redirect to login on auth failure
        // Using window.location.assign for better compatibility
        if (typeof window !== 'undefined') {
          window.location.assign('/login');
        }
      },
    });

    return {
      authService: new AuthService(apiClient),
      lmsService: new LMSService(apiClient),
      notificationService: new NotificationService(apiClient),
      assignmentService: new AssignmentService(apiClient),
      gradingService: new GradingService(apiClient),
    };
  }, [session?.accessToken, session?.refreshToken, session?.tenantId]);

  return <ApiContext.Provider value={services}>{children}</ApiContext.Provider>;
}

export function useApiServices(): ApiServices {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiServices must be used within ApiProvider');
  }
  return context;
}
