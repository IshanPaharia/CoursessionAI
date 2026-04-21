import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';
import { toast } from '../lib/toastStore.js';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.error || error?.message || fallback;
}

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
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to generate summary.'));
    },
  });
}
