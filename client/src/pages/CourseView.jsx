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
    <div className="flex h-full flex-col border-l-[3px] border-black bg-white">
      {/* Header */}
      <div className="border-b-[3px] border-black bg-[#ff99e6] p-4 brutal-shadow-sm z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider">Course Content</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-black ml-1 bg-white px-1.5 py-0.5 border-[2px] border-black">{overallProgress}%</span>
            {onClose && (
              <button onClick={onClose} className="text-black hover:scale-110 transition-transform bg-white border-[2px] border-black brutal-shadow-sm p-0.5">
                <X className="h-4 w-4 stroke-[3px]" />
              </button>
            )}
          </div>
        </div>
        <div className="progress-bar border-[2px] border-black bg-white h-3">
          <div className="h-full bg-black" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="mt-2 text-xs font-bold uppercase text-black">
          {watchedCount}/{videos.length} completed
        </p>
      </div>

      {/* Video list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
        {modules.map((mod) => {
          const moduleVideos = videos.filter(v => v.module_id === mod.id);
          const isCollapsed = collapsedModules[mod.id];

          return (
            <div key={mod.id} className="border-b-[3px] border-black last:border-b-0 bg-[#facc15]">
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-[#ff8c00]"
              >
                <span className="truncate">{mod.title}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-none border-[2px] border-black bg-white brutal-shadow-sm">
                  {isCollapsed
                    ? <ChevronDown className="h-4 w-4 shrink-0 stroke-[3px]" />
                    : <ChevronUp className="h-4 w-4 shrink-0 stroke-[3px]" />
                  }
                </span>
              </button>

              {!isCollapsed && (
                <div className="bg-white border-t-[3px] border-black">
                  {moduleVideos.map((video) => {
                    const isActive = video.id === currentVideoId;
                    const isWatched = progressMap[video.id]?.is_watched;

                    return (
                      <button
                        key={video.id}
                        onClick={() => onSelectVideo(video.id)}
                        className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-all duration-200 border-b-[2px] border-black last:border-b-0 ${
                          isActive ? 'bg-[#ff99e6]' : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
                          {isWatched ? (
                            <CheckCircle2 className={`h-5 w-5 stroke-[3px] ${isActive ? 'text-black' : 'text-gray-800'}`} />
                          ) : (
                            <Circle className={`h-5 w-5 stroke-[3px] ${isActive ? 'text-black' : 'text-gray-400'}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`line-clamp-2 text-sm uppercase transition-colors ${isActive ? 'text-black font-black' : 'text-black font-bold group-hover:underline decoration-2 underline-offset-2'}`}>
                            {video.title}
                          </p>
                          <span className={`mt-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-black' : 'text-gray-600'}`}>
                            <Clock className="h-3.5 w-3.5 stroke-[3px]" />
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-black stroke-[3px]" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-white text-black font-bold uppercase">
        <p className="text-xl">Course not found.</p>
        <Link to="/dashboard" className="text-sm bg-[#ff8c00] border-[2px] border-black brutal-shadow-sm px-4 py-2 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform">
          BACK TO DASHBOARD
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden bg-white text-black">
      {/* Shortcuts modal */}
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-3 lg:hidden transition-all bg-[#ff99e6] border-[3px] border-black brutal-shadow hover:-translate-y-1"
      >
        <Menu className="h-6 w-6 text-black stroke-[3px]" />
      </button>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {currentVideo ? (
          <div className="animate-fade-in pb-20 sm:pb-10">
            {/* Video Player */}
            <div className="w-full bg-[#facc15] border-b-[3px] border-black">
              <div className="mx-auto max-w-5xl aspect-video lg:p-6 lg:pb-0">
                <div className="w-full h-full lg:rounded-none overflow-hidden border-[3px] border-black bg-black lg:border-b-0 relative xl:border-b-[3px] lg:brutal-shadow xl:mb-6">
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
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-black uppercase tracking-tight leading-none">{currentVideo.title}</h2>
                  <p className="mt-4 text-sm font-bold uppercase tracking-widest text-black bg-white border-[2px] border-black inline-flex items-center gap-2 px-3 py-1.5 brutal-shadow-sm">
                    <span>Video {currentIndex + 1} of {videos.length}</span>
                    {currentVideo.duration > 0 && <span>· {formatDuration(currentVideo.duration)}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Desktop sidebar toggle */}
                  <button
                    onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
                    className="hidden lg:flex shrink-0 border-[2px] border-black bg-[#ff8c00] p-2.5 text-black brutal-shadow-sm transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5"
                    title={desktopSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                  >
                    {desktopSidebarOpen ? <PanelRightClose className="h-5 w-5 stroke-[2.5px]" /> : <PanelRightOpen className="h-5 w-5 stroke-[2.5px]" />}
                  </button>
                  <Link
                    to={`/courses/${id}/settings`}
                    className="shrink-0 border-[2px] border-black bg-white p-2.5 text-black brutal-shadow-sm transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-black/5"
                  >
                    <Settings className="h-5 w-5 stroke-[2.5px]" />
                  </Link>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="btn-secondary px-5 py-3 text-sm disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <ChevronLeft className="h-5 w-5 stroke-[3px]" />
                  <span className="hidden sm:inline ml-1 font-bold uppercase">PREV</span>
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`flex items-center gap-2 px-6 sm:px-8 py-3 text-sm font-black uppercase tracking-wider transition-all duration-200 border-[3px] border-black brutal-shadow hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none ${
                    isWatched
                      ? 'bg-white text-black'
                      : 'bg-[#ff99e6] text-black'
                  }`}
                >
                  <CheckCircle2 className="h-6 w-6 stroke-[3px]" />
                  {isWatched ? 'COMPLETED' : 'MARK WATCHED'}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= videos.length - 1}
                  className="btn-secondary px-5 py-3 text-sm disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-row-reverse sm:flex-row"
                >
                  <span className="hidden sm:inline mr-1 font-bold uppercase">NEXT</span>
                  <ChevronRight className="h-5 w-5 stroke-[3px]" />
                </button>
              </div>

              {/* Quiz — oriented with video (right below player) */}
              <div className="mt-8 sm:mt-10 animate-slide-up">
                <VideoQuiz videoId={currentVideo.id} />
              </div>

              {/* AI Summary */}
              <div className="mt-8">
                <VideoSummary videoId={currentVideo.id} />
              </div>

              {currentVideo.description && (
                <div className="mt-8 brutal-card bg-white p-0 overflow-hidden">
                  <div 
                    className="p-5 sm:p-6 flex items-center justify-between cursor-pointer group bg-[#facc15] hover:bg-[#ff8c00] transition-colors"
                    onClick={() => setDescExpanded(!descExpanded)}
                  >
                    <h3 className="text-base font-black tracking-widest uppercase text-black">Description</h3>
                    <div className="text-black bg-white border-[2px] border-black p-1 brutal-shadow-sm group-hover:-translate-y-0.5 transition-transform">
                      {descExpanded ? <ChevronUp className="h-5 w-5 stroke-[3px]" /> : <ChevronDown className="h-5 w-5 stroke-[3px]" />}
                    </div>
                  </div>
                  {descExpanded && (
                    <div className="prose prose-lg max-w-none text-black font-medium tracking-wide px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t-[3px] border-black bg-white">
                      <p className="whitespace-pre-wrap mt-6 leading-relaxed">{currentVideo.description}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
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
          <div className="flex h-full items-center justify-center p-8 bg-white">
            <div className="brutal-card bg-[#facc15] text-center p-8 sm:p-12 max-w-md w-full animate-fade-in">
              <div className="bg-white border-[3px] border-black w-20 h-20 mx-auto mb-6 flex items-center justify-center brutal-shadow">
                <PlayCircle className="h-10 w-10 text-black stroke-[3px]" />
              </div>
              <h3 className="text-3xl font-display font-extrabold text-black uppercase mb-4">Ready to learn?</h3>
              <p className="text-black font-bold text-lg">Select a video from the sidebar to start watching your course.</p>
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
        <div className="hidden lg:block w-80 shrink-0 z-10 border-l-[3px] border-black bg-white brutal-shadow">
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
