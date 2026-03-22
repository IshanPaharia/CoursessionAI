import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ArrowRight, Play, BookOpen, BarChart3, Sparkles, Layers, Bookmark } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="relative overflow-hidden selection:bg-purple-500/30">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-blob" />
      <div className="pointer-events-none absolute -right-20 top-20 h-[500px] w-[500px] rounded-full bg-pink-600/15 blur-[100px] animate-blob animation-delay-2000" />
      <div className="pointer-events-none absolute -bottom-40 left-10 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[100px] animate-blob animation-delay-4000" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-32 animate-fade-in">
        <div className="text-center animate-slide-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning Platform
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl lg:text-8xl">
            <span className="block text-white mb-2">We Are</span>
            <span className="block text-gradient pb-2">
              Coursession
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl font-light">
            Transform any YouTube playlist into a structured, interactive learning experience.
            Track progress, take notes, and let AI organize your curriculum.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={isSignedIn ? '/dashboard' : '/sign-up'}
              className="group relative flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 animate-shimmer"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="group flex items-center gap-2 rounded-full border border-white/10 glass-panel px-8 py-3.5 text-sm font-medium text-gray-300 transition-all hover:border-white/20 hover:text-white hover:bg-white/5"
            >
              <Play className="h-4 w-4 text-purple-400 group-hover:text-pink-400 transition-colors" />
              See How It Works
            </a>
          </div>
        </div>

        {/* Mock UI preview */}
        <div className="relative mx-auto mt-20 max-w-4xl animate-slide-up animation-delay-2000">
          <div className="glass-card p-2">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3 bg-black/20 rounded-t-xl">
              <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              <div className="h-3 w-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <div className="ml-4 flex-1">
                <div className="mx-auto max-w-sm rounded-md bg-white/5 px-3 py-1 text-center text-xs text-gray-400 font-mono">
                  coursession.ai/dashboard
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-5 bg-black/10 rounded-b-xl">
              {[1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20 relative">
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="p-4">
                    <div className="mb-3 h-3 w-3/4 rounded bg-white/10" />
                    <div className="h-2 w-1/2 rounded bg-white/5" />
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${[65, 30, 90][i - 1]}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-purple-500/10 to-transparent blur-xl -z-10" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-5xl tracking-tight">
            Everything You Need to <span className="text-gradient">Learn</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400 font-light text-lg">
            A complete learning management system built around YouTube content.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Play,
              title: 'One-Click Import',
              desc: 'Paste any YouTube playlist URL. We extract all video metadata, thumbnails, and durations automatically.',
            },
            {
              icon: Layers,
              title: 'Smart Chapters',
              desc: 'AI organizes your videos into logical chapters. Drag-and-drop to customize the structure.',
            },
            {
              icon: BarChart3,
              title: 'Progress Tracking',
              desc: 'Mark videos complete, see progress bars, and pick up exactly where you left off.',
            },
            {
              icon: BookOpen,
              title: 'Personal Notes',
              desc: 'Take notes on any video with auto-save. Your thoughts, always attached to the right lesson.',
            },
            {
              icon: Bookmark,
              title: 'Video Bookmarks',
              desc: 'Bookmark key moments with timestamps. One click to jump back to the important parts.',
            },
            {
              icon: Sparkles,
              title: 'AI-Powered',
              desc: 'Generate course descriptions and chapter organizations with AI. Smart learning, less effort.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass-card group p-6"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/5 transition-colors group-hover:from-purple-500/30 group-hover:to-pink-500/30 group-hover:border-purple-500/30 shadow-inner block">
                <Icon className="h-7 w-7 text-purple-400 drop-shadow-md" />
              </div>
              <h3 className="text-xl font-semibold text-white tracking-wide">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400 font-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden glass-card !rounded-3xl p-12 text-center sm:p-20 border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-[#050508]/80 to-pink-500/10 -z-10" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/20 blur-[80px] animate-blob" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-pink-500/15 blur-[80px] animate-blob animation-delay-2000" />

          <h2 className="relative text-4xl font-bold text-white sm:text-5xl tracking-tight">
            Start Learning <span className="text-gradient">Smarter</span>
          </h2>
          <p className="relative mx-auto mt-6 max-w-lg text-gray-300 font-light text-lg">
            Join learners who transform YouTube playlists into structured courses.
            Free to get started.
          </p>
          <Link
            to={isSignedIn ? '/dashboard' : '/sign-up'}
            className="relative mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20 py-10 mt-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-purple-400" />
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
