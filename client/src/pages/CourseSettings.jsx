import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Search,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCourse, useDeleteCourse } from '../hooks/useCourses';
import { useToggleWatched } from '../hooks/useProgress';
import api from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function SortableVideoItem({ video, isWatched, selected, onToggleSelect, onToggleWatched }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#0d0d14] px-3 py-2"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-gray-600 hover:text-gray-400">
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(video.id)}
        className="h-4 w-4 rounded border-gray-600 bg-transparent accent-purple-500"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-gray-300">{video.title}</p>
      </div>
      <button
        onClick={() => onToggleWatched(video.id, !isWatched)}
        className={`shrink-0 rounded p-1 ${isWatched ? 'text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
      >
        <CheckCircle2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CourseSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useCourse(id);
  const deleteCourse = useDeleteCourse();
  const toggleWatched = useToggleWatched(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [aiChapters, setAiChapters] = useState(null);

  const course = data?.course;
  const modules = data?.modules || [];
  const videos = data?.videos || [];
  const progress = data?.progress || [];

  const progressMap = useMemo(() => {
    const map = {};
    for (const p of progress) map[p.video_id] = p;
    return map;
  }, [progress]);

  if (!initialized && course) {
    setTitle(course.title);
    setDescription(course.description || '');
    setInitialized(true);
  }

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase();
    return videos.filter(v => v.title.toLowerCase().includes(q));
  }, [videos, searchQuery]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const saveCourse = useMutation({
    mutationFn: () => api.put(`/api/courses/${id}`, { title, description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', id] }),
  });

  const addModule = useMutation({
    mutationFn: () => api.post(`/api/modules/course/${id}`, { title: newModuleTitle || 'New Chapter' }),
    onSuccess: () => {
      setNewModuleTitle('');
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
  });

  const removeModule = useMutation({
    mutationFn: (moduleId) => api.delete(`/api/modules/${moduleId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', id] }),
  });

  const aiDescription = useMutation({
    mutationFn: () => api.post('/api/ai/generate-description', { courseId: Number(id) }),
    onSuccess: (res) => {
      setDescription(res.data.description);
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
  });

  const aiChaptersMutation = useMutation({
    mutationFn: () => api.post('/api/ai/generate-chapters', { courseId: Number(id) }),
    onSuccess: (res) => setAiChapters(res.data.chapters),
  });

  const applyChapters = useMutation({
    mutationFn: (chapters) => api.post('/api/ai/apply-chapters', { courseId: Number(id), chapters }),
    onSuccess: () => {
      setAiChapters(null);
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
  });

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex(v => v.id === active.id);
    const newIndex = videos.findIndex(v => v.id === over.id);
    const reordered = arrayMove(videos, oldIndex, newIndex);

    const updates = reordered.map((v, i) => ({
      videoId: v.id,
      moduleId: v.module_id,
      orderIndex: i,
    }));

    await api.put(`/api/modules/course/${id}/reorder`, { updates });
    queryClient.invalidateQueries({ queryKey: ['course', id] });
  };

  const handleBulkMarkWatched = () => {
    for (const videoId of selectedVideos) {
      toggleWatched.mutate({ videoId, isWatched: true });
    }
    setSelectedVideos(new Set());
  };

  const toggleSelect = (videoId) => {
    setSelectedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this course? This cannot be undone.')) {
      deleteCourse.mutate(Number(id), {
        onSuccess: () => navigate('/dashboard'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Course not found.</p>
        <Link to="/dashboard" className="text-sm text-purple-400 hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Link
          to={`/courses/${id}`}
          className="rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-white">Course Settings</h1>
      </div>

      {/* Course info */}
      <section className="mb-8 rounded-xl border border-white/5 bg-[#111118] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Course Info</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50 resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => saveCourse.mutate()}
              disabled={saveCourse.isPending}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saveCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
            <button
              onClick={() => aiDescription.mutate()}
              disabled={aiDescription.isPending}
              className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20 disabled:opacity-50"
            >
              {aiDescription.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Description
            </button>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="mb-8 rounded-xl border border-white/5 bg-[#111118] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Chapters</h2>
          <button
            onClick={() => aiChaptersMutation.mutate()}
            disabled={aiChaptersMutation.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 transition-colors hover:bg-purple-500/20 disabled:opacity-50"
          >
            {aiChaptersMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Auto-Organize
          </button>
        </div>

        {aiChapters && (
          <div className="mb-4 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
            <p className="mb-2 text-xs font-semibold text-purple-400">AI Suggested Chapters:</p>
            <div className="space-y-1.5">
              {aiChapters.map((ch, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{ch.title}</span>
                  <span className="text-xs text-gray-500">{ch.videoIds?.length || 0} videos</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => applyChapters.mutate(aiChapters)}
                disabled={applyChapters.isPending}
                className="rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/30"
              >
                {applyChapters.isPending ? 'Applying...' : 'Apply'}
              </button>
              <button
                onClick={() => setAiChapters(null)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {modules.map((mod) => (
            <div key={mod.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#0d0d14] px-4 py-3">
              <span className="flex-1 text-sm text-white">{mod.title}</span>
              <span className="text-xs text-gray-500">
                {videos.filter(v => v.module_id === mod.id).length} videos
              </span>
              <button
                onClick={() => removeModule.mutate(mod.id)}
                className="text-gray-600 transition-colors hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="Chapter name..."
            className="flex-1 rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
          />
          <button
            onClick={() => addModule.mutate()}
            disabled={addModule.isPending}
            className="flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm text-purple-400 transition-colors hover:bg-purple-500/20"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

      {/* Videos */}
      <section className="mb-8 rounded-xl border border-white/5 bg-[#111118] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Videos ({videos.length})</h2>
          {selectedVideos.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{selectedVideos.size} selected</span>
              <button
                onClick={handleBulkMarkWatched}
                className="flex items-center gap-1 rounded-lg bg-green-500/10 px-2 py-1 text-xs text-green-400"
              >
                <CheckCircle2 className="h-3 w-3" />
                Mark Watched
              </button>
              <button
                onClick={() => setSelectedVideos(new Set())}
                className="text-gray-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="mb-3 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full rounded-lg border border-white/10 bg-[#0d0d14] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredVideos.map(v => v.id)} strategy={verticalListSortingStrategy}>
              {filteredVideos.map((video) => (
                <SortableVideoItem
                  key={video.id}
                  video={video}
                  isWatched={progressMap[video.id]?.is_watched}
                  selected={selectedVideos.has(video.id)}
                  onToggleSelect={toggleSelect}
                  onToggleWatched={(videoId, isWatched) => toggleWatched.mutate({ videoId, isWatched })}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-500/10 bg-red-500/5 p-6">
        <h2 className="mb-2 text-sm font-semibold text-red-400">Danger Zone</h2>
        <p className="mb-4 text-sm text-gray-400">Permanently delete this course and all its data.</p>
        <button
          onClick={handleDelete}
          disabled={deleteCourse.isPending}
          className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4" />
          Delete Course
        </button>
      </section>
    </div>
  );
}
