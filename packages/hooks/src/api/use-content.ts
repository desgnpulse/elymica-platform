import { useMutation } from '@tanstack/react-query';
import {
  ContentService,
  CreateLessonRequest,
  CreateModuleRequest,
} from '@elymica/api-client';

export function useCreateLesson(contentService: ContentService) {
  return useMutation({
    mutationFn: (payload: CreateLessonRequest) => contentService.createLesson(payload),
  });
}

export function useCreateModule(contentService: ContentService) {
  return useMutation({
    mutationFn: (payload: CreateModuleRequest) => contentService.createModule(payload),
  });
}
