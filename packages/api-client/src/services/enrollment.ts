import { AxiosInstance } from 'axios';
import {
  GetParentChildrenResponse,
  GetParentChildrenResponseSchema,
  ClassRosterResponse,
  ClassRosterResponseSchema,
} from '../types/enrollment';

/**
 * Enrollment Service API Client
 */
export class EnrollmentService {
  constructor(private client: AxiosInstance) {}

  async getParentChildren(parentId: string): Promise<GetParentChildrenResponse> {
    const { data } = await this.client.get(`/api/enrollment/parents/${parentId}/children`);
    return GetParentChildrenResponseSchema.parse(data);
  }

  async getClassRoster(classId: string): Promise<ClassRosterResponse> {
    const { data } = await this.client.get(`/api/enrollment/classes/${classId}/students`);
    return ClassRosterResponseSchema.parse(data);
  }
}
