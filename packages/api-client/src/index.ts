/**
 * Elymica API Client
 * Typed SDK for backend microservices
 */

export { createApiClient } from './lib/axios-instance';
export type { ApiClientConfig } from './lib/axios-instance';

// Services
export { AuthService } from './services/auth';
export { LMSService } from './services/lms';
export { NotificationService } from './services/notifications';
export { AssignmentService } from './services/assignments';
export { GradingService } from './services/grading';
export { EnrollmentService } from './services/enrollment';
export { AnalyticsService } from './services/analytics';
export { ContentService } from './services/content';

// Types
export * from './types/auth';
export * from './types/lms';
export * from './types/notifications';
export * from './types/assignments';
export * from './types/grading';
export * from './types/enrollment';
export * from './types/analytics';
export * from './types/content';
