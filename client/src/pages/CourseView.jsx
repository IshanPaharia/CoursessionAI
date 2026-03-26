import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Settings,
  Loader2,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  PanelRightClose,
  PanelRightOpen,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../lib/api.js';
import { useCourse } from '../hooks/useCourses';
import { useToggleWatched } from '../hooks/useProgress';
import VideoNotes from '../components/VideoNotes';
import VideoBookmarks from '../components/VideoBookmarks';
import VideoQuiz from '../components/VideoQuiz';
import VideoSummary from '../components/VideoSummary';
import VideoChat from '../components/VideoChat';
import ShortcutsModal from '../components/ShortcutsModal';

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function VideoSidebar({ courseId, modules, videos, progress, currentVideoId, onSelectVideo, onClose }) {
  const queryClient = useQueryClient();
  const [collapsedModules, setCollapsedModules] = useState({});
  const progressMap = useMemo(() => {
    const map = {};
    for (const p of progress) map[p.video_id] = p;
    return map;
  }, [progress]);

  const watchedCount = progress.filter(p => p.is_watched).length;
  const overallProgress = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

  const toggleModule = (id) => {
    setCollapsedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full flex-col border-l border-white/[0.06]" style={{ backgroundColor: 'rgba(10, 10, 15, 0.9)' }}>
      {/* Header */}
      <div className="border-b border-white/[0.06] p-4 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Course Content</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 ml-1">{overallProgress}%</span>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {watchedCount}/{videos.length} completed
        </p>
      </div>

      {/* Video list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {modules.map((mod) => {
          const moduleVideos = videos.filter(v => v.module_id === mod.id);
          const isCollapsed = collapsedModules[mod.id];

          return (
            <div key={mod.id} className="border-b border-white/[0.04] last:border-0">
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:text-amber-300 hover:bg-white/[0.03]"
              >
                <span className="truncate">{mod.title}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5">
                  {isCollapsed
                    ? <ChevronDown className="h-3 w-3 shrink-0" />
                    : <ChevronUp className="h-3 w-3 shrink-0" />
                  }
                </span>
              </button>

              {!isCollapsed && (
                <div className="pb-1">
                  {moduleVideos.map((video) => {
                    const isActive = video.id === currentVideoId;
                    const isWatched = progressMap[video.id]?.is_watched;

                    return (
                      <button
                        key={video.id}
                        onClick={() => onSelectVideo(video.id)}
                        className={`group flex w-full items-start gap-3 px-4 py-2.5 text-left transition-all duration-200 relative ${
                          isActive ? 'bg-amber-500/8' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full" style={{ background: 'linear-gradient(to bottom, #f59e0b, #f97316)' }} />
                        )}
                        <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
                          {isWatched ? (
                            <CheckCircle2 className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-emerald-500/60'}`} />
                          ) : (
                            <Circle className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-gray-600'}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`line-clamp-2 text-[13px] transition-colors ${isActive ? 'text-white font-semibold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                            {video.title}
                          </p>
                          <span className={`mt-1 flex items-center gap-1 text-[11px] ${isActive ? 'text-amber-400/70' : 'text-gray-600'}`}>
                            <Clock className="h-3 w-3" />
                            {formatDuration(video.duration)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CourseView() {
  const { id } = useParams();
  const { data, isLoading, error } = useCourse(id);
  const toggleWatched = useToggleWatched(id);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const videos = data?.videos || [];
  const modules = data?.modules || [];
  const progress = data?.progress || [];
  const course = data?.course;

  const currentVideo = useMemo(
    () => videos.find(v => v.id === currentVideoId),
    [videos, currentVideoId]
  );

  const currentIndex = useMemo(
    () => videos.findIndex(v => v.id === currentVideoId),
    [videos, currentVideoId]
  );

  const isWatched = useMemo(
    () => progress.find(p => p.video_id === currentVideoId)?.is_watched || false,
    [progress, currentVideoId]
  );

  useEffect(() => {
    if (videos.length > 0 && !currentVideoId) {
      const unwatched = videos.find(
        v => !progress.find(p => p.video_id === v.id && p.is_watched)
      );
      setCurrentVideoId(unwatched?.id || videos[0].id);
    }
  }, [videos, progress, currentVideoId]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentVideoId(videos[currentIndex - 1].id);
  }, [currentIndex, videos]);

  const handleNext = useCallback(() => {
    if (currentIndex < videos.length - 1) setCurrentVideoId(videos[currentIndex + 1].id);
  }, [currentIndex, videos]);

  const handleToggleWatched = useCallback(() => {
    if (currentVideoId) {
      toggleWatched.mutate({ videoId: currentVideoId, isWatched: !isWatched });
    }
  }, [currentVideoId, isWatched, toggleWatched]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'n': handleNext(); break;
        case 'p': handlePrev(); break;
        case 'm': handleToggleWatched(); break;
        case 's': setSidebarOpen(prev => !prev); break;
        case '?': setShortcutsOpen(prev => !prev); break;
        case 'Escape': setShortcutsOpen(false); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleToggleWatched]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Course not found.</p>
        <Link to="/dashboard" className="text-sm text-amber-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Shortcuts modal */}
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full p-3 shadow-lg lg:hidden hover:scale-110 transition-transform"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)' }}
      >
        <Menu className="h-5 w-5 text-white" />
      </button>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {currentVideo ? (
          <div className="animate-fade-in pb-20 sm:pb-10">
            {/* Video Player */}
            <div className="w-full bg-black border-b border-white/[0.06]">
              <div className="mx-auto max-w-5xl aspect-video lg:p-4">
                <div className="w-full h-full lg:rounded-2xl overflow-hidden border border-white/[0.06] bg-black relative" style={{ boxShadow: '0 0 40px rgba(251, 146, 60, 0.08)' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?rel=0`}
                    title={currentVideo.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* Below Video Content */}
            <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6">
              {/* Title & Settings */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{currentVideo.title}</h2>
                  <p className="mt-2 text-sm text-gray-400 font-medium bg-white/5 inline-flex items-center gap-2 px-3 py-1 rounded-full">
                    <span>Video {currentIndex + 1} of {videos.length}</span>
                    {currentVideo.duration > 0 && <span>· {formatDuration(currentVideo.duration)}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Desktop sidebar toggle */}
                  <button
                    onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
                    className="hidden lg:flex shrink-0 rounded-xl border border-white/10 p-2.5 text-gray-400 transition-all hover:text-white hover:bg-white/5"
                    title={desktopSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                  >
                    {desktopSidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                  </button>
                  <Link
                    to={`/courses/${id}/settings`}
                    className="shrink-0 rounded-xl border border-white/10 p-2.5 text-gray-400 transition-all hover:text-white hover:bg-white/5"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="btn-secondary px-4 py-2.5 text-sm disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`flex items-center gap-2 rounded-xl px-5 sm:px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                    isWatched
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'btn-primary'
                  }`}
                  style={!isWatched ? { boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' } : {}}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {isWatched ? 'Completed' : 'Mark Watched'}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= videos.length - 1}
                  className="btn-secondary px-4 py-2.5 text-sm disabled:opacity-30"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Quiz — oriented with video (right below player) */}
              <div className="mt-6 sm:mt-8 animate-slide-up">
                <VideoQuiz videoId={currentVideo.id} />
              </div>

              {/* AI Summary */}
              <div className="mt-6">
                <VideoSummary videoId={currentVideo.id} />
              </div>

              {currentVideo.description && (
                <div className="mt-6 card-warm">
                  <div 
                    className="p-5 sm:p-6 flex items-center justify-between cursor-pointer group"
                    onClick={() => setDescExpanded(!descExpanded)}
                  >
                    <h3 className="text-sm font-bold tracking-wider uppercase text-amber-400/70">Description</h3>
                    <div className="text-gray-400 group-hover:text-white transition-colors">
                      {descExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                  {descExpanded && (
                    <div className="prose prose-invert max-w-none text-sm text-gray-400 tracking-wide font-light px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-white/[0.04]">
                      <p className="whitespace-pre-wrap mt-4">{currentVideo.description}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <VideoNotes videoId={currentVideo.id} />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <VideoBookmarks videoId={currentVideo.id} youtubeId={currentVideo.youtube_id} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="card-warm text-center p-8 sm:p-12 max-w-md w-full animate-fade-in border-dashed border-2 border-white/10">
              <PlayCircle className="h-12 w-12 text-amber-400/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ready to learn?</h3>
              <p className="text-gray-400 font-light">Select a video from the sidebar to start watching your course.</p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 shadow-2xl slide-in-from-right">
            <VideoSidebar
              courseId={course.id}
              modules={modules}
              videos={videos}
              progress={progress}
              currentVideoId={currentVideoId}
              onSelectVideo={(id) => { setCurrentVideoId(id); setSidebarOpen(false); }}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sidebar - desktop */}
      {desktopSidebarOpen && (
        <div className="hidden lg:block w-80 shrink-0 z-10 border-l border-white/[0.06]" style={{ boxShadow: '-5px 0 25px rgba(0,0,0,0.3)' }}>
          <VideoSidebar
            courseId={course.id}
            modules={modules}
            videos={videos}
            progress={progress}
            currentVideoId={currentVideoId}
            onSelectVideo={setCurrentVideoId}
          />
        </div>
      )}

      {/* AI Chat */}
      {currentVideo && <VideoChat videoId={currentVideo.id} />}
    </div>
  );
}
