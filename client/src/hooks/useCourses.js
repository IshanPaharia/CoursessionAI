import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';
import { toast } from '../lib/toastStore.js';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.error || error?.message || fallback;
}

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
    mutationFn: async ({ playlistUrl, aiGenerateVideoOrder, aiGenerateChapters }) => {
      const { data } = await api.post('/api/courses', {
        playlistUrl,
        aiGenerateVideoOrder,
        aiGenerateChapters,
      });
      return data;
    },
    onMutate: () => toast.loading('Creating course...'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to create course.'));
    },
    onSettled: (_data, _error, _variables, toastId) => {
      toast.dismiss(toastId);
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
    onMutate: () => toast.loading('Deleting course...'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to delete course.'));
    },
    onSettled: (_data, _error, _variables, toastId) => {
      toast.dismiss(toastId);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, description, aiGenerateVideoOrder, aiGenerateChapters }) => {
      const { data } = await api.put(`/api/courses/${id}`, {
        title,
        description,
        aiGenerateVideoOrder,
        aiGenerateChapters,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
