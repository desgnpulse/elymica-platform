import { AxiosInstance } from 'axios';
import {
  ListAssignmentsResponse,
  ListAssignmentsResponseSchema,
  GetFeedbackResponse,
  GetFeedbackResponseSchema,
} from '../types/assignments';

/**
 * Assignment Service API Client
 * Assignment submission and feedback
 */
export class AssignmentService {
  constructor(private client: AxiosInstance) {}

  /**
   * List assignments with optional filters
   */
  async listAssignments(params?: {
    course_id?: string;
    status?: 'pending' | 'submitted' | 'graded';
    student_id?: string;
  }): Promise<ListAssignmentsResponse> {
    const { data } = await this.client.get('/api/assignments', { params });
    return ListAssignmentsResponseSchema.parse(data);
  }

  /**
   * Submit assignment with file
   */
  async submitAssignment(
    assignmentId: string,
    file: File,
    notes?: string
  ): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }

    await this.client.post(`/api/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get assignment feedback
   */
  async getFeedback(assignmentId: string): Promise<GetFeedbackResponse> {
    const { data } = await this.client.get(`/api/assignments/${assignmentId}/feedback`);
    return GetFeedbackResponseSchema.parse(data);
  }
}
