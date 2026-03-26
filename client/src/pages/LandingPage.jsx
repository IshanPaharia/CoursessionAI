import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ArrowRight, Play, BookOpen, BarChart3, Sparkles, Layers, Bookmark, Zap, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="relative overflow-hidden selection:bg-amber-500/30 pb-16 sm:pb-0">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-blob" />
      <div className="pointer-events-none absolute -right-20 top-40 h-[400px] w-[400px] rounded-full bg-rose-500/8 blur-[100px] animate-blob animation-delay-2000" />
      <div className="pointer-events-none absolute -bottom-40 left-10 h-[400px] w-[400px] rounded-full bg-orange-500/8 blur-[100px] animate-blob animation-delay-4000" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-28 lg:pt-32 animate-fade-in">
        <div className="text-center animate-slide-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning Platform
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            <span className="block text-white mb-1">We Are</span>
            <span className="block text-gradient pb-2">
              Coursession
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg lg:text-xl font-light px-4">
            Transform any YouTube playlist into a structured, interactive learning experience.
            Track progress, take notes, and let AI organize your curriculum.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row px-4">
            <Link
              to={isSignedIn ? '/dashboard' : '/sign-up'}
              className="group w-full sm:w-auto relative flex items-center justify-center gap-2 btn-primary px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base animate-shimmer"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 btn-secondary px-7 py-3.5 sm:px-8 sm:py-4"
            >
              <Play className="h-4 w-4 text-amber-400 group-hover:text-orange-400 transition-colors" />
              See How It Works
            </a>
          </div>
        </div>

        {/* Mock UI preview */}
        <div className="relative mx-auto mt-14 sm:mt-20 max-w-4xl animate-slide-up animation-delay-2000 px-2">
          <div className="glass-card p-1.5 sm:p-2">
            <div className="flex items-center gap-1.5 sm:gap-2 border-b border-white/5 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/20 rounded-t-xl">
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500/80" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500/80" />
              <div className="ml-3 sm:ml-4 flex-1">
                <div className="mx-auto max-w-sm rounded-md bg-white/5 px-3 py-1 text-center text-[10px] sm:text-xs text-gray-400 font-mono">
                  coursession.ai/dashboard
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-5 bg-black/10 rounded-b-xl">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur transition-all duration-300 hover:border-amber-500/30 ${i === 3 ? 'hidden sm:block' : ''}`}>
                  <div className="aspect-video bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 relative">
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="mb-2 sm:mb-3 h-3 w-3/4 rounded bg-white/10" />
                    <div className="h-2 w-1/2 rounded bg-white/5" />
                    <div className="mt-3 sm:mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${[65, 30, 90][i - 1]}%`,
                          background: 'linear-gradient(90deg, #f59e0b, #f97316, #f43f5e)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-amber-500/8 to-transparent blur-xl -z-10" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">
            Everything You Need to <span className="text-gradient">Learn</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400 font-light text-base sm:text-lg px-4">
            A complete learning management system built around YouTube content.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
          {[
            {
              icon: Play,
              title: 'One-Click Import',
              desc: 'Paste any YouTube playlist URL. We extract all video metadata, thumbnails, and durations automatically.',
              gradient: 'from-amber-500/20 to-orange-500/20',
              iconColor: 'text-amber-400',
            },
            {
              icon: Layers,
              title: 'Smart Chapters',
              desc: 'AI organizes your videos into logical chapters. Drag-and-drop to customize the structure.',
              gradient: 'from-orange-500/20 to-rose-500/20',
              iconColor: 'text-orange-400',
            },
            {
              icon: BarChart3,
              title: 'Progress Tracking',
              desc: 'Mark videos complete, see progress bars, and pick up exactly where you left off.',
              gradient: 'from-rose-500/20 to-pink-500/20',
              iconColor: 'text-rose-400',
            },
            {
              icon: BookOpen,
              title: 'Personal Notes',
              desc: 'Take notes on any video with auto-save. Your thoughts, always attached to the right lesson.',
              gradient: 'from-emerald-500/20 to-teal-500/20',
              iconColor: 'text-emerald-400',
            },
            {
              icon: Bookmark,
              title: 'Video Bookmarks',
              desc: 'Bookmark key moments with timestamps. One click to jump back to the important parts.',
              gradient: 'from-blue-500/20 to-cyan-500/20',
              iconColor: 'text-blue-400',
            },
            {
              icon: Sparkles,
              title: 'AI-Powered',
              desc: 'Generate quizzes, summaries, and chat with AI about your videos. Smart learning, less effort.',
              gradient: 'from-violet-500/20 to-purple-500/20',
              iconColor: 'text-violet-400',
            },
          ].map(({ icon: Icon, title, desc, gradient, iconColor }) => (
            <div key={title} className="glass-card group p-5 sm:p-6">
              <div className={`mb-4 sm:mb-5 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} border border-white/5 transition-all group-hover:scale-110 duration-300`}>
                <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${iconColor} drop-shadow-md`} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white tracking-wide">{title}</h3>
              <p className="mt-2 sm:mt-3 text-sm leading-relaxed text-gray-400 font-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">
            How It <span className="text-gradient">Works</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto px-2 sm:px-0">
          {[
            { step: '01', title: 'Paste', desc: 'Drop a YouTube playlist URL into Coursession.', icon: Zap },
            { step: '02', title: 'Organize', desc: 'AI auto-groups your videos into smart chapters.', icon: Layers },
            { step: '03', title: 'Learn', desc: 'Watch, take notes, quiz yourself, and track progress.', icon: BookOpen },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="relative text-center p-6 sm:p-8 card-warm">
              <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl mb-4 sm:mb-6" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(244, 63, 94, 0.1))' }}>
                <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" />
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-amber-500/60 tracking-widest mb-2 uppercase">Step {step}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 font-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6">
        <div className="relative overflow-hidden glass-card !rounded-2xl sm:!rounded-3xl p-8 sm:p-12 lg:p-20 text-center border-amber-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 -z-10" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 sm:h-60 sm:w-60 rounded-full bg-amber-500/15 blur-[80px] animate-blob" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 sm:h-60 sm:w-60 rounded-full bg-rose-500/10 blur-[80px] animate-blob animation-delay-2000" />

          <h2 className="relative text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">
            Start Learning <span className="text-gradient">Smarter</span>
          </h2>
          <p className="relative mx-auto mt-4 sm:mt-6 max-w-lg text-gray-300 font-light text-base sm:text-lg px-4">
            Join learners who transform YouTube playlists into structured courses.
            Free to get started.
          </p>
          <Link
            to={isSignedIn ? '/dashboard' : '/sign-up'}
            className="relative mt-8 sm:mt-10 inline-flex items-center gap-2 btn-primary px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20 py-8 sm:py-10 backdrop-blur-md mb-14 sm:mb-0">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <BookOpen className="h-5 w-5 text-amber-400" />
            <span className="text-gradient font-bold text-lg">
              CoursessionAI
            </span>
          </div>
          <p className="font-light">— Transform playlists into knowledge.</p>
        </div>
      </footer>
    </div>
  );
}
