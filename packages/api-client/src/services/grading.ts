import { AxiosInstance } from 'axios';
import {
  GetStudentGradesResponse,
  GetStudentGradesResponseSchema,
  SubmitGradeRequest,
  SubmitGradeResponse,
  SubmitGradeResponseSchema,
} from '../types/grading';

/**
 * Grading Service API Client
 * Student grades and performance data
 */
export class GradingService {
  constructor(private client: AxiosInstance) {}

  /**
   * Get student grades with summary
   */
  async getStudentGrades(
    studentId: string,
    courseId?: string
  ): Promise<GetStudentGradesResponse> {
    const params = courseId ? { course_id: courseId } : undefined;
    const { data } = await this.client.get(
      `/api/grading/students/${studentId}/grades`,
      { params }
    );
    return GetStudentGradesResponseSchema.parse(data);
  }

  /**
   * Submit grade/feedback for assignment
   */
  async submitGrade(
    assignmentId: string,
    payload: SubmitGradeRequest
  ): Promise<SubmitGradeResponse> {
    const { data } = await this.client.post(
      `/api/grading/assignments/${assignmentId}/grade`,
      payload
    );
    return SubmitGradeResponseSchema.parse(data);
  }
}
