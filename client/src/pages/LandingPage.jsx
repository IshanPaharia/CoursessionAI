import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ArrowRight, Play, BookOpen, BarChart3, Sparkles, Layers, Bookmark, Zap } from 'lucide-react';
import icon from '../assets/icon.png';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  const primaryCta = isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <div className="w-full min-h-screen pb-16 sm:pb-0 relative bg-background">
      <section className="relative w-full pt-20 sm:pt-28 pb-20 px-4 sm:px-6 z-10">
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline text-primary text-sm font-semibold mb-8 animate-slide-up">
            <Sparkles className="h-4 w-4" />
            <span>AI-assisted course builder</span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl leading-[1.1] tracking-tight mb-8 max-w-5xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Turn YouTube playlists into structured courses with AI
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-on-surface-variant leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Paste a playlist URL and CoursessionAI organizes the videos into a course you can watch, track, review, and study at your own pace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link
              to={primaryCta}
              className="btn-primary text-lg px-8 py-4"
            >
              Start learning — it's free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary text-lg px-8 py-4"
            >
              <Play className="h-5 w-5 text-primary fill-primary/20" />
              How it works
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative w-full py-24 sm:py-32 px-4 sm:px-6 z-10 border-t border-outline-variant bg-surface-container">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              How It Works
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              CoursessionAI keeps the playlist as the source, then adds structure around it so it feels like a real course.
            </p>
          </div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto relative">
            {[
              {
                step: '01',
                title: 'Paste a playlist',
                desc: 'Add a public YouTube playlist URL. The app pulls in the videos, titles, descriptions, thumbnails, and durations.',
                icon: <Zap className="h-8 w-8 text-primary" />,
              },
              {
                step: '02',
                title: 'Review the course',
                desc: 'AI can suggest chapters, summaries, and quizzes, while you can rename, reorder, and organize the course yourself.',
                icon: <Layers className="h-8 w-8 text-primary" />,
              },
              {
                step: '03',
                title: 'Learn with context',
                desc: 'Watch videos, track progress, save notes, add bookmarks, and ask the AI tutor questions about the current lesson.',
                icon: <BookOpen className="h-8 w-8 text-primary" />,
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="learning-card relative group flex flex-col items-center text-center mt-10 md:mt-0">
                <div className="absolute -top-10 z-10 h-20 w-20 rounded-full bg-background border-4 border-surface flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
                  {icon}
                </div>
                <div className="mt-12 w-full">
                  <div className="text-sm font-bold text-outline uppercase tracking-wider mb-2">Step {step}</div>
                  <h3 className="font-display text-2xl font-bold mb-4">{title}</h3>
                  <p className="font-medium text-on-surface-variant leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative w-full py-24 sm:py-32 px-4 sm:px-6 z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Built For Focused Study
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              The product is simple on purpose: courses, progress, notes, bookmarks, quizzes, summaries, and chat.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {[
              {
                title: 'Course dashboard',
                label: 'Playlist courses, tags, progress',
                icon: <BarChart3 className="h-8 w-8 text-primary" />,
              },
              {
                title: 'Course player',
                label: 'Video, chapters, notes, bookmarks',
                icon: <Play className="h-8 w-8 text-primary" />,
              },
              {
                title: 'AI study tools',
                label: 'Summary, quiz, tutor chat',
                icon: <Bookmark className="h-8 w-8 text-primary" />,
              },
            ].map(({ title, label, icon }) => (
              <div key={title} className="learning-card bg-surface p-0 overflow-hidden">
                <div className="aspect-[4/3] border-b border-outline-variant bg-surface-container-low p-4">
                  <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-outline bg-surface text-on-surface-variant">
                    <div className="flex flex-col items-center gap-3 text-center px-6">
                      {icon}
                      <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold mb-3">{title}</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed">
                    A focused workspace for watching, reviewing, and studying each course.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative w-full py-24 px-4 sm:px-6 z-10 border-t border-outline-variant">
        <div className="mx-auto max-w-4xl text-center">
          <img src={icon} alt="Logo" loading="lazy" className="h-12 w-12 mx-auto mb-6 dark:invert" />
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Ready to turn a playlist into a course?
          </h2>
          <p className="text-xl text-on-surface-variant mb-10 max-w-xl mx-auto">
            Start with any public YouTube playlist and organize it into a learning path.
          </p>
          <Link
            to={primaryCta}
            className="btn-primary text-lg px-8 py-4 w-full sm:w-auto relative z-10"
          >
            Start learning — it's free
          </Link>
        </div>
      </section>

      <footer className="w-full bg-surface border-t border-outline-variant py-12 text-on-surface-variant">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-1 items-center gap-3">
            <img src={icon} alt="Logo" loading="lazy" className="h-6 w-6 dark:invert" />
            <span className="font-display font-bold text-xl tracking-tight text-on-surface">
              CoursessionAI
            </span>
          </div>
          
          <p className="font-medium text-sm text-center">© 2026 CoursessionAI.</p>
          
          <div className="flex flex-1 justify-center md:justify-end gap-6 text-sm font-medium">
            Made with love for learning!
          </div>
        </div>
      </footer>
    </div>
  );
}
