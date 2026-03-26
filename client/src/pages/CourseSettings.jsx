import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { useCourse, useUpdateCourse } from '../hooks/useCourses';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../lib/api.js';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/Toast';

function SortableVideoItem({ video }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-600 hover:text-gray-300 transition-colors active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 text-sm text-gray-300 truncate">{video.title}</span>
    </div>
  );
}

export default function CourseSettings() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const addToast = useToast();
  const { data, isLoading } = useCourse(id);
  const updateCourse = useUpdateCourse();
  const updateModule = useUpdateModule();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [chapterSuggestions, setChapterSuggestions] = useState(null);
  const [generatingChapters, setGeneratingChapters] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [localVideos, setLocalVideos] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  const course = data?.course;
  const modules = data?.modules || [];
  const videos = data?.videos || [];

  if (course && !initialized) {
    setTitle(course.title || '');
    setDescription(course.description || '');
    setLocalVideos([...videos]);
    setInitialized(true);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSave = () => {
    updateCourse.mutate({ id, title, description }, {
      onSuccess: () => addToast('Course updated!', 'success'),
    });
  };

  const handleGenerateDescription = async () => {
    setGeneratingDesc(true);
    try {
      const { data } = await api.post('/api/ai/generate-description', { courseId: Number(id) });
      setDescription(data.description);
      addToast('Description generated!', 'success');
    } catch (err) {
      addToast('Failed to generate description', 'error');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleGenerateChapters = async () => {
    setGeneratingChapters(true);
    try {
      const { data } = await api.post('/api/ai/generate-chapters', { courseId: Number(id) });
      setChapterSuggestions(data.chapters);
      addToast('Chapters suggested!', 'success');
    } catch (err) {
      addToast('Failed to generate chapters', 'error');
    } finally {
      setGeneratingChapters(false);
    }
  };

  const handleApplyChapters = async () => {
    if (!chapterSuggestions) return;
    try {
      await api.post('/api/ai/apply-chapters', {
        courseId: Number(id),
        chapters: chapterSuggestions,
      });
      addToast('Chapters applied!', 'success');
      setChapterSuggestions(null);
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    } catch (err) {
      addToast('Failed to apply chapters', 'error');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = localVideos.findIndex(v => v.id === active.id);
      const newIndex = localVideos.findIndex(v => v.id === over.id);
      const newOrder = arrayMove(localVideos, oldIndex, newIndex);
      setLocalVideos(newOrder);

      try {
        for (let i = 0; i < newOrder.length; i++) {
          await api.put(`/api/videos/${newOrder[i].id}`, { orderIndex: i });
        }
        queryClient.invalidateQueries({ queryKey: ['course', id] });
        addToast('Video order updated!', 'success');
      } catch (err) {
        addToast('Failed to update order', 'error');
      }
    }
  };

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Course not found.</p>
        <Link to="/dashboard" className="text-sm text-amber-400 hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8 sm:px-6 pb-20 sm:pb-8 animate-fade-in">
      <Link to={`/courses/${id}`} className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 sm:mb-8 tracking-tight">
        Course <span className="text-gradient">Settings</span>
      </h1>

      {/* Title & Description */}
      <div className="card-warm p-5 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-gray-300">Details</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
              <button
                onClick={handleGenerateDescription}
                disabled={generatingDesc}
                className="flex items-center gap-1 text-xs font-semibold text-amber-400 transition-colors hover:text-amber-300"
              >
                {generatingDesc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                AI Generate
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-field resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={updateCourse.isPending}
            className="btn-primary px-6 py-2.5 w-full sm:w-auto justify-center"
          >
            {updateCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* AI Chapters */}
      <div className="card-warm p-5 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">AI Chapters</h2>
          <button
            onClick={handleGenerateChapters}
            disabled={generatingChapters}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
          >
            {generatingChapters ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate Chapters
          </button>
        </div>

        {chapterSuggestions && (
          <div className="space-y-3 mb-4">
            <p className="text-xs text-gray-500">Suggested chapter grouping:</p>
            {chapterSuggestions.map((ch, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] p-3" style={{ backgroundColor: 'rgba(13, 13, 20, 0.5)' }}>
                <h4 className="text-sm font-semibold text-white">{ch.title}</h4>
                <p className="mt-1 text-xs text-gray-500">{ch.videoIds?.length || 0} videos</p>
              </div>
            ))}
            <button
              onClick={handleApplyChapters}
              className="btn-primary w-full py-2.5 justify-center"
            >
              Apply Chapters
            </button>
          </div>
        )}

        {/* Current Modules */}
        {modules.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">Current modules:</p>
            {modules.map((mod) => (
              <div key={mod.id} className="rounded-xl border border-white/[0.06]" style={{ backgroundColor: 'rgba(13, 13, 20, 0.3)' }}>
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-amber-400/70" />
                    <span className="text-sm font-medium text-gray-300">{mod.title}</span>
                  </div>
                  <span className="text-gray-600">
                    {expandedModules[mod.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>
                {expandedModules[mod.id] && (
                  <div className="border-t border-white/[0.04] px-4 py-2 space-y-1">
                    {videos.filter(v => v.module_id === mod.id).map(v => (
                      <p key={v.id} className="text-xs text-gray-500 py-1 truncate">{v.title}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Order */}
      <div className="card-warm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Video Order</h2>
            <p className="text-xs text-gray-500 mt-1">Drag to reorder videos manually.</p>
          </div>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localVideos.map(v => v.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {localVideos.map((video) => (
                <SortableVideoItem key={video.id} video={video} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
