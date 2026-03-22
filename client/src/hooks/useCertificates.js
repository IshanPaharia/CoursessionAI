import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useCertificate(courseId) {
  return useQuery({
    queryKey: ['certificate', courseId],
    queryFn: async () => {
      const { data } = await api.get(`/api/certificates/${courseId}`);
      return data.certificate;
    },
    enabled: !!courseId,
  });
}

export function useGenerateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId) => {
      const { data } = await api.post(`/api/certificates/${courseId}/generate`);
      return data.certificate;
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['certificate', courseId] });
    },
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId) => {
      const { data } = await api.patch(`/api/courses/${courseId}/pin`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
