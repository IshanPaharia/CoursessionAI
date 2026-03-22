import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useQuiz(videoId) {
  return useQuery({
    queryKey: ['quiz', videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/quizzes/${videoId}`);
      return data;
    },
    enabled: !!videoId,
  });
}

export function useGenerateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId) => {
      const { data } = await api.post(`/api/quizzes/generate/${videoId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, answers }) => {
      const { data } = await api.post(`/api/quizzes/${quizId}/submit`, { answers });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
  });
}
