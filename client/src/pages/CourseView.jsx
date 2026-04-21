import { lazy, Suspense, useState, useMemo, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { useCourse } from '../hooks/useCourses';
import { useToggleWatched } from '../hooks/useProgress';
import ErrorBoundary from '../components/ErrorBoundary';

const VideoNotes = lazy(() => import('../components/VideoNotes'));
const VideoBookmarks = lazy(() => import('../components/VideoBookmarks'));
const VideoQuiz = lazy(() => import('../components/VideoQuiz'));
const VideoSummary = lazy(() => import('../components/VideoSummary'));
const VideoChat = lazy(() => import('../components/VideoChat'));
const ShortcutsModal = lazy(() => import('../components/ShortcutsModal'));

function PanelLoader({ label = 'Loading...' }) {
  return (
    <div className="learning-card flex min-h-24 items-center justify-center gap-3 bg-surface p-5 text-on-surface-variant">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

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
    for (const p of progress) map[p.video_id] = p;
    return map;
  }, [progress]);

  const watchedCount = progress.filter(p => p.is_watched).length;
  const overallProgress = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

  const toggleModule = (id) => {
    setCollapsedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full flex-col border-l border-outline-variant bg-surface">
      {/* Header */}
      <div className="border-b border-outline-variant bg-surface-container p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Course Content</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">{overallProgress}%</span>
            {onClose && (
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-md transition-colors p-1 border border-transparent">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="mt-2 text-xs font-medium text-on-surface-variant">
          {watchedCount}/{videos.length} completed
        </p>
      </div>

      {/* Video list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface">
        {modules.map((mod) => {
          const moduleVideos = videos.filter(v => v.module_id === mod.id);
          const isCollapsed = collapsedModules[mod.id];

          return (
            <div key={mod.id} className="border-b border-outline-variant last:border-b-0 bg-surface">
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold tracking-wide text-on-surface transition-colors hover:bg-surface-container"
              >
                <span className="truncate">{mod.title}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-outline-variant bg-surface shadow-sm text-on-surface-variant">
                  {isCollapsed
                    ? <ChevronDown className="h-4 w-4 shrink-0" />
                    : <ChevronUp className="h-4 w-4 shrink-0" />
                  }
                </span>
              </button>

              {!isCollapsed && (
                <div className="bg-surface border-t border-outline-variant">
                  {moduleVideos.map((video) => {
                    const isActive = video.id === currentVideoId;
                    const isWatched = progressMap[video.id]?.is_watched;

                    return (
                      <button
                        key={video.id}
                        onClick={() => onSelectVideo(video.id)}
                        className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-200 border-b border-outline-variant last:border-b-0 ${
                          isActive ? 'bg-primary/5' : 'bg-surface hover:bg-surface-container'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
                          {isWatched ? (
                            <CheckCircle2 className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-green-500'}`} />
                          ) : (
                            <Circle className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`line-clamp-2 text-sm transition-colors ${isActive ? 'text-primary font-semibold' : 'text-on-surface font-medium group-hover:text-primary'}`}>
                            {video.title}
                          </p>
                          <span className={`mt-1 flex items-center gap-1 text-xs font-medium ${isActive ? 'text-primary/80' : 'text-on-surface-variant'}`}>
                            <Clock className="h-3.5 w-3.5" />
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
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showSettingsHint, setShowSettingsHint] = useState(false);

  const videos = useMemo(() => data?.videos || [], [data?.videos]);
  const modules = useMemo(() => data?.modules || [], [data?.modules]);
  const progress = useMemo(() => data?.progress || [], [data?.progress]);
  const course = data?.course;

  useEffect(() => {
    if (!id) return;
    const key = `coursessionai.course-settings-hint:${id}`;
    if (window.localStorage.getItem(key)) return;

    window.localStorage.setItem(key, '1');
    const showTimeout = window.setTimeout(() => {
      setShowSettingsHint(true);
    }, 0);
    const hideTimeout = window.setTimeout(() => {
      setShowSettingsHint(false);
    }, 6500);

    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, [id]);

  const currentVideoId = useMemo(() => {
    if (selectedVideoId && videos.some(v => v.id === selectedVideoId)) {
      return selectedVideoId;
    }

    const unwatched = videos.find(
      v => !progress.find(p => p.video_id === v.id && p.is_watched)
    );

    return unwatched?.id || videos[0]?.id || null;
  }, [selectedVideoId, videos, progress]);

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

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setSelectedVideoId(videos[currentIndex - 1].id);
  }, [currentIndex, videos]);

  const handleNext = useCallback(() => {
    if (currentIndex < videos.length - 1) setSelectedVideoId(videos[currentIndex + 1].id);
  }, [currentIndex, videos]);

  const handleToggleWatched = useCallback(() => {
    if (currentVideoId) {
      setSelectedVideoId(currentVideoId);
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-background text-on-surface">
        <p className="text-xl font-semibold">Course not found.</p>
        <Link to="/dashboard" className="text-sm btn-primary px-4 py-2">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden bg-background text-on-surface">
      {/* Shortcuts modal */}
      <Suspense fallback={null}>
        <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </Suspense>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-3 lg:hidden transition-all bg-surface border border-outline-variant shadow-lg rounded-full hover:-translate-y-1"
      >
        <Menu className="h-6 w-6 text-on-surface" />
      </button>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {currentVideo ? (
          <div className="animate-fade-in pb-20 sm:pb-10">
            {/* Video Player */}
            <div className="w-full bg-black">
              <div className="mx-auto max-w-5xl aspect-video lg:p-6 lg:pb-0">
                <div className="w-full h-full lg:rounded-xl overflow-hidden bg-black relative lg:shadow-xl lg:mb-6">
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
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
              {/* Title & Settings */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight leading-tight text-on-surface">{currentVideo.title}</h2>
                  <p className="mt-4 text-sm font-medium tracking-wide text-on-surface-variant bg-surface-container rounded-full inline-flex items-center gap-2 px-3 py-1.5 border border-outline-variant">
                    <span>Video {currentIndex + 1} of {videos.length}</span>
                    {currentVideo.duration > 0 && <span>· {formatDuration(currentVideo.duration)}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <Link
                      to={`/courses/${id}/settings`}
                      className="shrink-0 border border-outline-variant bg-surface rounded-md p-2.5 text-on-surface hover:bg-surface-container transition-colors shadow-sm"
                    >
                      <Settings className="h-5 w-5" />
                    </Link>
                    {showSettingsHint && (
                      <div className="absolute right-full top-0 z-30 mr-4 w-72 max-w-[calc(100vw-theme(spacing.20))] rounded-md border border-outline-variant bg-surface px-4 py-3 text-sm font-medium text-on-surface shadow-xl md:w-80">
                        <div className="flex items-start gap-3">
                          <span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse" />
                          <span className="min-w-0 flex-1 leading-relaxed">
                            Open course settings here to adjust the import options and other course details.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSettingsHint(false);
                              window.localStorage.setItem(`coursessionai.course-settings-hint:${id}`, '1');
                            }}
                            className="shrink-0 text-on-surface-variant hover:text-on-surface p-1 rounded-sm hover:bg-surface-container transition-colors"
                            aria-label="Dismiss settings hint"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="btn-secondary px-5 py-3 text-sm flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline font-semibold">Prev</span>
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`flex items-center gap-2 px-6 sm:px-8 py-3 text-sm font-semibold rounded-md shadow-sm transition-colors border ${
                    isWatched
                      ? 'bg-green-50 text-green-700 border-green-500 hover:bg-green-100'
                      : 'btn-primary'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {isWatched ? 'Completed' : 'Mark Watched'}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= videos.length - 1}
                  className="btn-secondary px-5 py-3 text-sm flex items-center gap-1 flex-row-reverse sm:flex-row"
                >
                  <span className="hidden sm:inline font-semibold text-right">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* AI Summary - Order swapped to be above VideoQuiz */}
              <div className="mt-10 animate-slide-up">
                <ErrorBoundary title="Summary unavailable" resetKey={`summary-${currentVideo.id}`}>
                  <Suspense fallback={<PanelLoader label="Loading summary..." />}>
                    <VideoSummary videoId={currentVideo.id} />
                  </Suspense>
                </ErrorBoundary>
              </div>

              {/* Quiz — Order swapped to be below VideoSummary */}
              <div className="mt-8">
                <ErrorBoundary title="Quiz unavailable" resetKey={`quiz-${currentVideo.id}`}>
                  <Suspense fallback={<PanelLoader label="Loading quiz..." />}>
                    <VideoQuiz videoId={currentVideo.id} />
                  </Suspense>
                </ErrorBoundary>
              </div>

              {currentVideo.description && (
                <div className="mt-8 learning-card p-0 bg-surface">
                  <div 
                    className="p-5 sm:p-6 flex items-center justify-between cursor-pointer group hover:bg-surface-container transition-colors"
                    onClick={() => setDescExpanded(!descExpanded)}
                  >
                    <h3 className="text-base font-semibold tracking-tight text-on-surface">Description</h3>
                    <div className="text-on-surface-variant p-1 rounded-sm group-hover:bg-surface transition-colors border border-transparent">
                      {descExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                  {descExpanded && (
                    <div className="prose max-w-none text-on-surface font-medium px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-outline-variant">
                      <p className="whitespace-pre-wrap mt-6 leading-relaxed">{currentVideo.description}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="animate-slide-up h-full" style={{ animationDelay: '100ms' }}>
                  <Suspense fallback={<PanelLoader label="Loading notes..." />}>
                    <VideoNotes videoId={currentVideo.id} />
                  </Suspense>
                </div>
                <div className="animate-slide-up h-full" style={{ animationDelay: '200ms' }}>
                  <Suspense fallback={<PanelLoader label="Loading bookmarks..." />}>
                    <VideoBookmarks videoId={currentVideo.id} youtubeId={currentVideo.youtube_id} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8 bg-background">
            <div className="learning-card text-center p-8 sm:p-12 max-w-md w-full animate-fade-in flex flex-col items-center">
              <div className="bg-surface-container rounded-full p-6 mb-6 inline-flex">
                <PlayCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-on-surface mb-4">Ready to learn?</h3>
              <p className="text-on-surface-variant font-medium">Select a video from the sidebar to start watching your course.</p>
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
              modules={modules}
              videos={videos}
              progress={progress}
              currentVideoId={currentVideoId}
              onSelectVideo={(id) => { setSelectedVideoId(id); setSidebarOpen(false); }}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar floating toggle (Tag style) */}
      <button
        onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
        className={`hidden lg:flex fixed top-[5.5rem] z-50 h-10 w-8 items-center justify-center bg-surface border border-outline-variant rounded-l-lg transition-all duration-500 ease-in-out hover:bg-surface-container shadow-sm group ${
          desktopSidebarOpen ? 'right-80' : 'right-0'
        }`}
        title={desktopSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-l-lg transition-colors" />
        {desktopSidebarOpen ? (
          <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-primary group-hover:scale-110 transition-all" />
        )}
      </button>

      {/* Sidebar - desktop */}
      <div 
        className={`hidden lg:block shrink-0 z-10 bg-surface shadow-xl transition-all duration-500 ease-in-out overflow-hidden border-outline-variant ${
          desktopSidebarOpen ? 'w-80 border-l opacity-100' : 'w-0 border-l-0 opacity-0'
        }`}
      >
        <div className="w-80 h-full"> {/* Inner wrapper to maintain content width during transition */}
          <VideoSidebar
            modules={modules}
            videos={videos}
            progress={progress}
            currentVideoId={currentVideoId}
            onSelectVideo={setSelectedVideoId}
          />
        </div>
      </div>

      {/* AI Chat */}
      {currentVideo && (
        <ErrorBoundary
          title="AI tutor unavailable"
          resetKey={`chat-${currentVideo.id}`}
          className="fixed bottom-24 left-4 z-50 sm:bottom-8 sm:left-8"
        >
          <Suspense fallback={null}>
            <VideoChat videoId={currentVideo.id} />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
