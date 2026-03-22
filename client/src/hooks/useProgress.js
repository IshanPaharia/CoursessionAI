import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useToggleWatched(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, isWatched }) => {
      const { data } = await api.put(`/api/progress/${videoId}`, { isWatched });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', String(courseId)] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
