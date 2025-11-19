import { AxiosInstance } from 'axios';
import {
  GetLessonResponse,
  GetLessonResponseSchema,
  CreateLessonRequest,
  CreateLessonResponse,
  CreateLessonResponseSchema,
  CreateModuleRequest,
  CreateModuleResponse,
  CreateModuleResponseSchema,
} from '../types/content';

/**
 * Content Service API Client
 */
export class ContentService {
  constructor(private client: AxiosInstance) {}

  async getLesson(lessonId: string): Promise<GetLessonResponse> {
    const { data } = await this.client.get(`/lessons/${lessonId}`);
    return GetLessonResponseSchema.parse(data);
  }

  async createLesson(payload: CreateLessonRequest): Promise<CreateLessonResponse> {
    const { data } = await this.client.post('/lessons', payload);
    return CreateLessonResponseSchema.parse(data);
  }

  async createModule(payload: CreateModuleRequest): Promise<CreateModuleResponse> {
    const { data } = await this.client.post('/modules', payload);
    return CreateModuleResponseSchema.parse(data);
  }
}
