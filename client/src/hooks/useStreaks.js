import { useQuery } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useStreaks() {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: async () => {
      const { data } = await api.get('/api/streaks');
      return data;
    },
  });
}
