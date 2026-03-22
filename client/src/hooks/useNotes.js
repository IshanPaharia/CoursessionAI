import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useNote(videoId) {
  return useQuery({
    queryKey: ['note', videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/notes/${videoId}/notes`);
      return data.notes;
    },
    enabled: !!videoId,
  });
}

export function useSaveNote(videoId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notes) => {
      const { data } = await api.post(`/api/notes/${videoId}/notes`, { notes });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', videoId] });
    },
  });
}

export function useBookmarks(videoId) {
  return useQuery({
    queryKey: ['bookmarks', videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/notes/${videoId}/bookmarks`);
      return data.bookmarks;
    },
    enabled: !!videoId,
  });
}

export function useCreateBookmark(videoId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ timestamp, note }) => {
      const { data } = await api.post(`/api/notes/${videoId}/bookmarks`, { timestamp, note });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', videoId] });
    },
  });
}

export function useDeleteBookmark(videoId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookmarkId) => {
      const { data } = await api.delete(`/api/notes/bookmarks/${bookmarkId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', videoId] });
    },
  });
}
