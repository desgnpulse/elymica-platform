import { AxiosInstance } from 'axios';
import {
  ListCoursesResponse,
  ListCoursesResponseSchema,
  GetCourseDetailsResponse,
  GetCourseDetailsResponseSchema,
  EnrollResponse,
  EnrollResponseSchema,
  CourseProgress,
} from '../types/lms';

/**
 * LMS Service API Client
 * Course management, enrollment, progress tracking
 */
export class LMSService {
  constructor(private client: AxiosInstance) {}

  /**
   * List courses with optional filters
   */
  async listCourses(params?: {
    status?: 'active' | 'archived';
    enrolled?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ListCoursesResponse> {
    const { data } = await this.client.get('/courses', { params });
    return ListCoursesResponseSchema.parse(data);
  }

  /**
   * Get course details with syllabus and progress
   */
  async getCourseDetails(courseId: string): Promise<GetCourseDetailsResponse> {
    const { data } = await this.client.get(`/courses/${courseId}`);
    return GetCourseDetailsResponseSchema.parse(data);
  }

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: string): Promise<EnrollResponse> {
    const { data } = await this.client.post(`/courses/${courseId}/enroll`);
    return EnrollResponseSchema.parse(data);
  }

  /**
   * Get progress for a specific course
   */
  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    const { data } = await this.client.get(`/courses/${courseId}/progress`);
    return data.progress;
  }

  /**
   * Mark lesson as complete
   */
  async markLessonComplete(
    lessonId: string,
    timeSpent: number,
    quizScore?: number
  ): Promise<void> {
    await this.client.post(`/lessons/${lessonId}/complete`, {
      time_spent_minutes: timeSpent,
      quiz_score: quizScore,
    });
  }
}
