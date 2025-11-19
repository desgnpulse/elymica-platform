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
  EnrollmentService,
  AnalyticsService,
} from '@elymica/api-client';

interface ApiServices {
  authService: AuthService;
  lmsService: LMSService;
  notificationService: NotificationService;
  assignmentService: AssignmentService;
  gradingService: GradingService;
  enrollmentService: EnrollmentService;
  analyticsService: AnalyticsService;
}

const ApiContext = createContext<ApiServices | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const services = useMemo(() => {
    const defaultBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.elymica.com';
    const enrollmentBaseURL =
      process.env.NEXT_PUBLIC_ENROLLMENT_BASE_URL || `${defaultBaseURL}/api/enrollment`;
    const analyticsBaseURL =
      process.env.NEXT_PUBLIC_ANALYTICS_BASE_URL || 'https://analytics.elymica.com/api';

    const clientConfig = {
      getAccessToken: () => session?.accessToken || null,
      getRefreshToken: () => session?.refreshToken || null,
      getTenantId: () => session?.tenantId || null,
      onTokenRefresh: () => {
        // NextAuth handles token rotation; this callback exists for client parity
        console.log('Parent portal API token refreshed');
      },
      onAuthError: () => {
        if (typeof window !== 'undefined') {
          window.location.assign('/login');
        }
      },
    } as const;

    const apiClient = createApiClient({
      baseURL: defaultBaseURL,
      ...clientConfig,
    });

    const enrollmentClient = createApiClient({
      baseURL: enrollmentBaseURL,
      ...clientConfig,
    });

    const analyticsClient = createApiClient({
      baseURL: analyticsBaseURL,
      ...clientConfig,
    });

    return {
      authService: new AuthService(apiClient),
      lmsService: new LMSService(apiClient),
      notificationService: new NotificationService(apiClient),
      assignmentService: new AssignmentService(apiClient),
      gradingService: new GradingService(apiClient),
      enrollmentService: new EnrollmentService(enrollmentClient),
      analyticsService: new AnalyticsService(analyticsClient),
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
