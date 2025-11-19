import { AxiosInstance } from 'axios';
import { AttendanceResponse, AttendanceResponseSchema } from '../types/analytics';

/**
 * Analytics Service API Client
 */
export class AnalyticsService {
  constructor(private client: AxiosInstance) {}

  async getStudentAttendance(studentId: string, params?: { from_date?: string; to_date?: string }): Promise<AttendanceResponse> {
    const { data } = await this.client.get(`/api/analytics/students/${studentId}/attendance`, {
      params,
    });
    return AttendanceResponseSchema.parse(data);
  }
}
