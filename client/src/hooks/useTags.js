import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await api.get('/api/tags');
      return data.tags;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color }) => {
      const { data } = await api.post('/api/tags', { name, color });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/api/tags/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useTagCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tagId, courseId }) => {
      const { data } = await api.post(`/api/tags/${tagId}/courses/${courseId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUntagCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tagId, courseId }) => {
      const { data } = await api.delete(`/api/tags/${tagId}/courses/${courseId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
