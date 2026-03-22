import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useSummary(videoId) {
  return useQuery({
    queryKey: ['summary', videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/summaries/${videoId}`);
      return data;
    },
    enabled: !!videoId,
  });
}

export function useGenerateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId) => {
      const { data } = await api.post(`/api/summaries/${videoId}/generate`);
      return data;
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['summary', videoId] });
    },
  });
}
