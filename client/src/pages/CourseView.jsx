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
} from 'lucide-react';
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

function VideoSidebar({ modules, videos, progress, currentVideoId, onSelectVideo, onClose }) {
  const [collapsedModules, setCollapsedModules] = useState({});
  const progressMap = useMemo(() => {
    const map = {};
    for (const p of progress) {
      map[p.video_id] = p;
    }
    return map;
  }, [progress]);

  const watchedCount = progress.filter(p => p.is_watched).length;
  const overallProgress = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

  const toggleModule = (id) => {
    setCollapsedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full flex-col border-r border-white/5 bg-[#050508]/80 backdrop-blur-xl">
      <div className="border-b border-white/5 p-5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">
            {watchedCount}/{videos.length} completed
          </span>
          <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{overallProgress}%</span>
          {onClose && (
            <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white lg:hidden transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] transition-all duration-1000 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {modules.map((mod) => {
          const moduleVideos = videos.filter(v => v.module_id === mod.id);
          const isCollapsed = collapsedModules[mod.id];

          return (
            <div key={mod.id} className="border-b border-white/5 last:border-0">
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 transition-all hover:text-purple-300 hover:bg-white/5 bg-white/[0.01]"
              >
                <span className="truncate">{mod.title}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
                  {isCollapsed
                    ? <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    : <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                  }
                </span>
              </button>

              {!isCollapsed && (
                <div className="py-2 bg-black/20">
                  {moduleVideos.map((video) => {
                    const isActive = video.id === currentVideoId;
                    const isWatched = progressMap[video.id]?.is_watched;

                    return (
                      <button
                        key={video.id}
                        onClick={() => onSelectVideo(video.id)}
                        className={`group flex w-full items-start gap-3 px-5 py-3 text-left transition-all duration-300 relative ${
                          isActive
                            ? 'bg-purple-500/10 hover:bg-purple-500/20'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        )}
                        <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
                          {isWatched ? (
                            <CheckCircle2 className={`h-4 w-4 ${isActive ? 'text-green-400' : 'text-green-500/70'}`} />
                          ) : (
                            <Circle className={`h-4 w-4 ${isActive ? 'text-purple-400' : 'text-gray-600'}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`line-clamp-2 text-sm transition-colors ${isActive ? 'text-white font-semibold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                            {video.title}
                          </p>
                          <span className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-purple-300/80' : 'text-gray-500'}`}>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      // Don't trigger when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'n':
          handleNext();
          break;
        case 'p':
          handlePrev();
          break;
        case 'm':
          handleToggleWatched();
          break;
        case 's':
          setSidebarOpen(prev => !prev);
          break;
        case '?':
          setShortcutsOpen(prev => !prev);
          break;
        case 'Escape':
          setShortcutsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleToggleWatched]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Course not found.</p>
        <Link to="/dashboard" className="text-sm text-purple-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] animate-blob -z-10" />

      {/* Shortcuts modal */}
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-3 shadow-[0_0_20px_rgba(168,85,247,0.4)] lg:hidden hover:scale-110 transition-transform"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>

      {/* Sidebar - mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative h-full w-80 shadow-2xl slide-in-from-right">
            <VideoSidebar
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
      <div className="hidden w-80 shrink-0 lg:block shadow-[5px_0_25px_rgba(0,0,0,0.5)] z-10 border-r border-white/5">
        <VideoSidebar
          modules={modules}
          videos={videos}
          progress={progress}
          currentVideoId={currentVideoId}
          onSelectVideo={setCurrentVideoId}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {currentVideo ? (
          <div className="animate-fade-in pb-10">
            <div className="w-full bg-[#030305] border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="mx-auto max-w-5xl aspect-video lg:p-4">
                <div className="w-full h-full lg:rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.15)] border border-white/10 bg-black relative">
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

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{currentVideo.title}</h2>
                  <p className="mt-2 text-sm text-gray-400 font-medium bg-white/5 inline-block px-3 py-1 rounded-full">
                    Video {currentIndex + 1} of {videos.length}
                    {currentVideo.duration > 0 && ` · ${formatDuration(currentVideo.duration)}`}
                  </p>
                </div>

                <Link
                  to={`/courses/${id}/settings`}
                  className="shrink-0 rounded-xl border border-white/10 p-2.5 text-gray-400 transition-all hover:text-white hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-300 shadow-lg ${
                    isWatched
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30 shadow-green-500/10 hover:shadow-green-500/20'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {isWatched ? 'Completed' : 'Mark as Watched'}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= videos.length - 1}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* AI Summary */}
              <div className="mt-8">
                <VideoSummary videoId={currentVideo.id} />
              </div>

              {currentVideo.description && (
                <div className="mt-6 glass-card p-6 border-white/5">
                  <h3 className="mb-3 text-sm font-bold tracking-wider uppercase text-purple-300/80">Description</h3>
                  <div className="prose prose-invert max-w-none text-sm text-gray-300/90 tracking-wide font-light">
                    <p className="whitespace-pre-wrap">{currentVideo.description}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="animate-slide-up animation-delay-2000">
                  <VideoNotes videoId={currentVideo.id} />
                </div>
                <div className="animate-slide-up animation-delay-4000">
                  <VideoBookmarks videoId={currentVideo.id} youtubeId={currentVideo.youtube_id} />
                </div>
              </div>

              {/* Quiz */}
              <div className="mt-6 animate-slide-up animation-delay-4000">
                <VideoQuiz videoId={currentVideo.id} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="glass-card text-center p-12 max-w-md w-full animate-fade-in border-dashed border-2 border-white/10 border-t-purple-500/30">
              <Play className="h-12 w-12 text-purple-500/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ready to learn?</h3>
              <p className="text-gray-400 font-light">Select a video from the sidebar to start watching your course.</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat */}
      {currentVideo && <VideoChat videoId={currentVideo.id} />}
    </div>
  );
}
