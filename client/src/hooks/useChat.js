import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useChatHistory(videoId) {
  return useQuery({
    queryKey: ['chat', videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/chat/${videoId}`);
      return data.messages;
    },
    enabled: !!videoId,
  });
}

export function useSendMessage(videoId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message) => {
      const { data } = await api.post(`/api/chat/${videoId}`, { message });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', videoId] });
    },
  });
}
