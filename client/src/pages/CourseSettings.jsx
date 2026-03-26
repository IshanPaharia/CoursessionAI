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
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 border-[3px] border-black px-4 py-3 bg-white transition-transform ${isDragging ? 'shadow-none translate-x-1 translate-y-1' : 'brutal-shadow-sm hover:-translate-y-0.5'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-black transition-colors active:cursor-grabbing hover:bg-gray-100 p-1 border-[2px] border-transparent hover:border-black"
      >
        <GripVertical className="h-5 w-5 stroke-[2.5px]" />
      </button>
      <span className="flex-1 text-sm font-bold uppercase tracking-wider text-black truncate">{video.title}</span>
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-black stroke-[3px]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-white text-black font-bold uppercase">
        <p className="text-xl">Course not found.</p>
        <Link to="/dashboard" className="text-sm border-[2px] border-black bg-[#ff8c00] px-4 py-2 brutal-shadow-sm hover:-translate-y-0.5 transition-transform">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 sm:px-6 pb-20 sm:pb-12 animate-fade-in text-black">
      <Link to={`/courses/${id}`} className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-black bg-white border-[2px] border-black px-4 py-2 brutal-shadow-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform">
        <ArrowLeft className="h-4 w-4 stroke-[3px]" />
        BACK TO COURSE
      </Link>

      <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-black mb-8 sm:mb-10 tracking-tight uppercase">
        Course Settings
      </h1>

      {/* Title & Description */}
      <div className="brutal-card bg-white p-6 sm:p-8 mb-6 sm:mb-8">
        <h2 className="text-base font-black text-black mb-6 uppercase tracking-widest border-b-[3px] border-black pb-2">Details</h2>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-bold text-black uppercase tracking-wider">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-none border-[3px] border-black px-4 py-3 text-base font-bold text-black bg-gray-50 outline-none brutal-shadow-sm focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all placeholder-gray-500"
            />
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-bold text-black uppercase tracking-wider">Description</label>
              <button
                onClick={handleGenerateDescription}
                disabled={generatingDesc}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-black bg-[#ff99e6] border-[2px] border-black px-3 py-1.5 brutal-shadow-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {generatingDesc ? <Loader2 className="h-4 w-4 animate-spin stroke-[3px]" /> : <Sparkles className="h-4 w-4 stroke-[2.5px]" />}
                AI GENERATE
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-none border-[3px] border-black px-4 py-3 text-base font-medium text-black bg-gray-50 outline-none brutal-shadow-sm focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={updateCourse.isPending}
            className="btn-primary px-8 py-3 w-full sm:w-auto justify-center text-lg mt-2"
          >
            {updateCourse.isPending ? <Loader2 className="h-5 w-5 animate-spin stroke-[3px]" /> : <Save className="h-5 w-5 stroke-[2.5px]" />}
            SAVE CHANGES
          </button>
        </div>
      </div>

      {/* AI Chapters */}
      <div className="brutal-card bg-[#facc15] p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-black uppercase tracking-widest text-black border-b-[3px] border-black pb-2 sm:border-none sm:pb-0">AI Chapters</h2>
          <button
            onClick={handleGenerateChapters}
            disabled={generatingChapters}
            className="flex items-center justify-center gap-2 border-[3px] border-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-widest text-black transition-transform hover:-translate-y-1 hover:-translate-x-1 brutal-shadow disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {generatingChapters ? <Loader2 className="h-5 w-5 animate-spin stroke-[3px]" /> : <Sparkles className="h-5 w-5 stroke-[2.5px]" />}
            GENERATE CHAPTERS
          </button>
        </div>

        {chapterSuggestions && (
          <div className="space-y-4 mb-6 bg-white border-[3px] border-black p-5 brutal-shadow-sm">
            <p className="text-sm font-bold uppercase text-black mb-2">Suggested grouping:</p>
            <div className="space-y-3">
              {chapterSuggestions.map((ch, i) => (
                <div key={i} className="border-[2px] border-black p-3 bg-gray-50">
                  <h4 className="text-base font-black uppercase text-black">{ch.title}</h4>
                  <p className="mt-1 text-sm font-bold text-gray-700">{ch.videoIds?.length || 0} videos</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleApplyChapters}
              className="btn-primary w-full py-3 mt-4 text-base bg-[#ff8c00] hover:bg-[#ff8c00] hover:-translate-y-0.5 brutal-shadow-sm"
            >
              APPLY CHAPTERS
            </button>
          </div>
        )}

        {/* Current Modules */}
        {modules.length > 0 && (
          <div className="space-y-3 mt-6">
            <p className="text-sm font-bold uppercase tracking-widest text-black mb-3">Current Chapters:</p>
            {modules.map((mod) => (
              <div key={mod.id} className="border-[3px] border-black bg-white overflow-hidden brutal-shadow-sm transition-all">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 stroke-[2.5px] text-black" />
                    <span className="text-sm sm:text-base font-black uppercase tracking-wider text-black">{mod.title}</span>
                  </div>
                  <span className="text-black bg-[#ff99e6] border-[2px] border-black p-1 brutal-shadow-sm">
                    {expandedModules[mod.id] ? <ChevronUp className="h-4 w-4 stroke-[3px]" /> : <ChevronDown className="h-4 w-4 stroke-[3px]" />}
                  </span>
                </button>
                {expandedModules[mod.id] && (
                  <div className="border-t-[3px] border-black px-5 py-3 space-y-2 bg-gray-50">
                    {videos.filter(v => v.module_id === mod.id).map(v => (
                      <p key={v.id} className="text-sm font-bold text-gray-800 py-1.5 border-b-[2px] border-gray-300 last:border-0 truncate flex items-center gap-2">
                        <span className="w-2 h-2 rounded-none bg-black inline-block"></span>
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
      <div className="brutal-card bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-[3px] border-black pb-4">
          <div>
            <h2 className="text-base font-black uppercase tracking-widest text-black">Video Order</h2>
            <p className="text-sm font-bold text-gray-700 mt-2">Drag to reorder videos manually.</p>
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
