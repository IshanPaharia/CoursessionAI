import { useQuery } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useLastWatched() {
  return useQuery({
    queryKey: ['lastWatched'],
    queryFn: async () => {
      const { data } = await api.get('/api/courses/last-watched');
      return data.lastWatched;
    },
  });
}
