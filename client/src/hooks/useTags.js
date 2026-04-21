import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';
import { toast } from '../lib/toastStore.js';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.error || error?.message || fallback;
}

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
    onMutate: () => toast.loading('Creating tag...'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Tag created.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to create tag.'));
    },
    onSettled: (_data, _error, _variables, toastId) => {
      toast.dismiss(toastId);
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
    onMutate: () => toast.loading('Deleting tag...'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Tag deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to delete tag.'));
    },
    onSettled: (_data, _error, _variables, toastId) => {
      toast.dismiss(toastId);
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
