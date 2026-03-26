import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useCourses(search, tag) {
  return useQuery({
    queryKey: ['courses', search, tag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search?.trim()) params.set('search', search.trim());
      if (tag) params.set('tag', tag);
      const query = params.toString();
      const { data } = await api.get(`/api/courses${query ? `?${query}` : ''}`);
      return data.courses;
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistUrl) => {
      const { data } = await api.post('/api/courses', { playlistUrl });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useCourse(id) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/courses/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/api/courses/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, description }) => {
      const { data } = await api.put(`/api/courses/${id}`, { title, description });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
