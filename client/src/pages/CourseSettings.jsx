import { useEffect, useState, useMemo } from 'react';
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
import HelpTooltip from '../components/HelpTooltip';

function SortableVideoItem({ video }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 border border-outline-variant px-4 py-3 bg-surface rounded-md transition-transform ${isDragging ? 'shadow-lg scale-[1.02]' : 'shadow-sm hover:-translate-y-0.5'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-on-surface-variant transition-colors active:cursor-grabbing hover:bg-surface-container rounded-sm p-1"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="flex-1 text-sm font-semibold tracking-wide text-on-surface truncate">{video.title}</span>
    </div>
  );
}

export default function CourseSettings() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const addToast = useToast();
  const { data, isLoading } = useCourse(id);
  const updateCourse = useUpdateCourse();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aiGenerateVideoOrder, setAiGenerateVideoOrder] = useState(false);
  const [aiGenerateChapters, setAiGenerateChapters] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [chapterSuggestions, setChapterSuggestions] = useState(null);
  const [generatingChapters, setGeneratingChapters] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [localVideos, setLocalVideos] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  const course = data?.course;
  const modules = useMemo(() => data?.modules || [], [data?.modules]);
  const videos = useMemo(() => data?.videos || [], [data?.videos]);

  useEffect(() => {
    setInitialized(false);
    setChapterSuggestions(null);
    setExpandedModules({});
  }, [id]);

  useEffect(() => {
    if (course && String(course.id) === String(id) && !initialized) {
      setTitle(course.title || '');
      setDescription(course.description || '');
      setAiGenerateVideoOrder(Boolean(course.ai_generate_video_order));
      setAiGenerateChapters(Boolean(course.ai_generate_chapters));
      setLocalVideos([...videos]);
      setInitialized(true);
    }
  }, [course, id, initialized, videos]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSave = () => {
    updateCourse.mutate({ id, title, description, aiGenerateVideoOrder, aiGenerateChapters }, {
      onSuccess: () => addToast('Course updated!', 'success'),
    });
  };

  const handleGenerateDescription = async () => {
    setGeneratingDesc(true);
    try {
      const { data } = await api.post('/api/ai/generate-description', { courseId: Number(id) });
      setDescription(data.description);
      addToast('Description generated!', 'success');
    } catch {
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
    } catch {
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
    } catch {
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
      } catch {
        addToast('Failed to update order', 'error');
      }
    }
  };

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-background text-on-surface">
        <p className="text-xl font-semibold">Course not found.</p>
        <Link to="/dashboard" className="text-sm btn-primary px-4 py-2">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 sm:px-6 pb-20 sm:pb-12 animate-fade-in text-on-surface">
      <Link to={`/courses/${id}`} className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-on-surface hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Link>

      <h1 className="text-4xl sm:text-5xl font-display font-bold mb-8 sm:mb-10 tracking-tight">
        Course Settings
      </h1>

      {/* Title & Description */}
      <div className="learning-card p-6 sm:p-8 mb-6 sm:mb-8 bg-surface">
        <h2 className="text-base font-semibold text-on-surface tracking-wide mb-6 border-b border-outline-variant pb-2">Details</h2>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface-variant tracking-wide">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-outline-variant px-4 py-3 text-base font-medium text-on-surface bg-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              placeholder="Course Title"
            />
          </div>
          <div>
            <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-sm font-semibold text-on-surface-variant tracking-wide">Description</label>
              <button
                onClick={handleGenerateDescription}
                disabled={generatingDesc}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold tracking-wide text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 sm:w-auto"
              >
                {generatingDesc ? (
                  <span className="flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing course content...
                  </span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-md border border-outline-variant px-4 py-3 text-base font-medium text-on-surface bg-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              placeholder="Course Description"
            />
          </div>
          <div className="rounded-md border border-outline-variant bg-surface-container/40 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <p className="text-sm font-semibold tracking-wide text-on-surface">AI Import Options</p>
              <HelpTooltip text="These settings control what happens when you create the course and can be updated later." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-start gap-3 rounded-md border border-outline-variant bg-surface px-4 py-3">
                <input
                  type="checkbox"
                  checked={aiGenerateVideoOrder}
                  onChange={(e) => setAiGenerateVideoOrder(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    <span>AI generated video order</span>
                    <HelpTooltip text="Reorders the course videos using AI when the playlist is created." />
                  </span>
                  <span className="mt-1 block text-xs font-medium text-on-surface-variant">
                    Useful for playlists that are out of sequence.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-md border border-outline-variant bg-surface px-4 py-3">
                <input
                  type="checkbox"
                  checked={aiGenerateChapters}
                  onChange={(e) => setAiGenerateChapters(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    <span>AI generated chapters</span>
                    <HelpTooltip text="Builds chapter modules from the imported videos after ordering is resolved." />
                  </span>
                  <span className="mt-1 block text-xs font-medium text-on-surface-variant">
                    Creates chapter groupings automatically.
                  </span>
                </span>
              </label>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={updateCourse.isPending}
            className="btn-primary px-8 py-3 w-full sm:w-auto justify-center text-sm font-semibold mt-2"
          >
            {updateCourse.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* AI Chapters */}
      <div className="learning-card p-6 sm:p-8 mb-6 sm:mb-8 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-semibold tracking-wide text-on-surface border-b border-outline-variant pb-2 sm:border-none sm:pb-0">AI Chapters</h2>
          <button
            onClick={handleGenerateChapters}
            disabled={generatingChapters}
            className="flex items-center justify-center gap-2 border border-outline-variant bg-surface px-4 py-2 text-sm font-semibold tracking-wide text-on-surface rounded-md shadow-sm transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            {generatingChapters ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Planning modules...
              </span>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-primary" />
                Generate Chapters
              </>
            )}
          </button>
        </div>

        {chapterSuggestions && (
          <div className="space-y-4 mb-6 bg-surface-container border border-outline-variant rounded-md p-5 shadow-sm">
            <p className="text-sm font-semibold text-on-surface mb-2">Suggested Grouping:</p>
            <div className="space-y-3">
              {chapterSuggestions.map((ch, i) => (
                <div key={i} className="border border-outline-variant rounded-md p-3 bg-surface shadow-sm">
                  <h4 className="text-sm font-semibold text-on-surface">{ch.title}</h4>
                  <p className="mt-1 text-xs font-medium text-on-surface-variant">{ch.videoIds?.length || 0} videos</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleApplyChapters}
              className="btn-primary w-full py-3 mt-4 text-sm font-semibold justify-center"
            >
              Apply Chapters
            </button>
          </div>
        )}

        {/* Current Modules */}
        {modules.length > 0 && (
          <div className="space-y-3 mt-6">
            <p className="text-sm font-semibold tracking-wide text-on-surface mb-3">Current Chapters:</p>
            {modules.map((mod) => (
              <div key={mod.id} className="border border-outline-variant bg-surface rounded-md overflow-hidden shadow-sm transition-all">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-on-surface-variant" />
                    <span className="text-sm sm:text-base font-semibold tracking-wide text-on-surface">{mod.title}</span>
                  </div>
                  <span className="text-on-surface-variant p-1 rounded-sm">
                    {expandedModules[mod.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>
                {expandedModules[mod.id] && (
                  <div className="border-t border-outline-variant px-5 py-3 space-y-2 bg-surface-container">
                    {videos.filter(v => v.module_id === mod.id).map(v => (
                      <p key={v.id} className="text-sm font-medium text-on-surface py-2 border-b border-outline-variant last:border-0 truncate flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                        {v.title}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Order */}
      <div className="learning-card p-6 sm:p-8 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-outline-variant pb-4">
          <div>
            <h2 className="text-base font-semibold tracking-wide text-on-surface">Video Order</h2>
            <p className="text-sm font-medium text-on-surface-variant mt-2">Drag to reorder videos manually.</p>
          </div>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localVideos.map(v => v.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
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
