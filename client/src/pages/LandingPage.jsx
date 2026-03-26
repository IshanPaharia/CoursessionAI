import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ArrowRight, Play, BookOpen, BarChart3, Sparkles, Layers, Bookmark, Zap } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="w-full bg-[#facc15] min-h-screen text-black font-sans pb-16 sm:pb-0">
      
      {/* Hero Section (Pink Background) */}
      <section className="w-full bg-[#ff99e6] border-b-[3px] border-black pb-20 pt-24 sm:pt-32 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <h1 className="font-display font-extrabold text-[clamp(4rem,10vw,8rem)] leading-[0.9] tracking-tighter uppercase mb-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <span className="block">Coursession</span>
              <span className="block">AI</span>
            </h1>
            
            <p className="mt-8 max-w-2xl text-xl sm:text-2xl font-medium leading-relaxed border-l-[4px] border-black pl-6">
              Transform any YouTube playlist into a structured, interactive learning experience.
              Track progress, take notes, and let AI organize your curriculum.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              <Link
                to={isSignedIn ? '/dashboard' : '/sign-up'}
                className="btn-primary"
              >
                START LEARNING FREE
                <ArrowRight className="h-6 w-6 ml-2" />
              </Link>
              <a
                href="#features"
                className="btn-secondary"
              >
                <Play className="h-6 w-6 mr-2 text-[#ff8c00] fill-[#ff8c00]" />
                SEE HOW IT WORKS
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Yellow Background) */}
      <section id="features" className="w-full bg-[#facc15] py-20 px-4 sm:px-6 border-b-[3px] border-black">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight">
              Everything You Need to
              <br />
              <span className="bg-black text-[#facc15] px-4 py-2 inline-block mt-2 brutal-shadow-sm rotate-1">LEARN</span>
            </h2>
          </div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Play,
                title: 'ONE-CLICK IMPORT',
                desc: 'Paste any YouTube playlist URL. We extract all video metadata, thumbnails, and durations automatically.',
                bg: 'bg-white',
              },
              {
                icon: Layers,
                title: 'SMART CHAPTERS',
                desc: 'AI organizes your videos into logical chapters. Drag-and-drop to customize the structure.',
                bg: 'bg-[#ff99e6]',
              },
              {
                icon: BarChart3,
                title: 'PROGRESS TRACKING',
                desc: 'Mark videos complete, see progress bars, and pick up exactly where you left off.',
                bg: 'bg-white',
              },
              {
                icon: BookOpen,
                title: 'PERSONAL NOTES',
                desc: 'Take notes on any video with auto-save. Your thoughts, always attached to the right lesson.',
                bg: 'bg-[#ff8c00]',
              },
              {
                icon: Bookmark,
                title: 'VIDEO BOOKMARKS',
                desc: 'Bookmark key moments with timestamps. One click to jump back to the important parts.',
                bg: 'bg-white',
              },
              {
                icon: Sparkles,
                title: 'AI-POWERED',
                desc: 'Generate quizzes, summaries, and chat with AI about your videos. Smart learning, less effort.',
                bg: 'bg-[#ff99e6]',
              },
            ].map(({ icon: Icon, title, desc, bg }, index) => (
              <div key={title} className={`brutal-card ${bg} p-8 flex flex-col items-start ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'} hover:rotate-0 transition-transform duration-200`}>
                <div className="h-14 w-14 border-[3px] border-black rounded-none flex items-center justify-center bg-white mb-6 brutal-shadow-sm">
                  <Icon className="h-7 w-7 text-black stroke-[3px]" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide mb-3">{title}</h3>
                <p className="text-base font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full bg-[#ff99e6] py-20 px-4 sm:px-6 border-b-[3px] border-black">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-16">
            <h2 className="font-display text-5xl sm:text-7xl font-extrabold uppercase tracking-tight">
              HOW IT WORKS
            </h2>
          </div>
          
          <div className="grid gap-12 sm:gap-8 grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'PASTE', desc: 'Drop a YouTube playlist URL into Coursession.', icon: Zap },
              { step: '02', title: 'ORGANIZE', desc: 'AI auto-groups your videos into smart chapters.', icon: Layers },
              { step: '03', title: 'LEARN', desc: 'Watch, take notes, quiz yourself, and track progress.', icon: BookOpen },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="brutal-card bg-white p-8 relative mt-10 sm:mt-0">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 border-[3px] border-black bg-[#ff8c00] flex items-center justify-center brutal-shadow-sm font-display text-3xl font-bold">
                  {step}
                </div>
                <div className="mt-12">
                  <h3 className="font-display text-2xl font-bold mb-4 uppercase">{title}</h3>
                  <p className="font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-[#facc15] py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="brutal-card bg-white p-12 text-center">
            <h2 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight mb-6">
              START LEARNING
              <br/>
              <span className="bg-[#ff8c00] px-4 font-black">SMARTER</span>
            </h2>
            <p className="text-xl font-medium mb-10 max-w-xl mx-auto">
              Join learners who transform YouTube playlists into structured courses. Free to get started.
            </p>
            <Link
              to={isSignedIn ? '/dashboard' : '/sign-up'}
              className="btn-primary text-lg px-8 py-5 inline-flex"
            >
              CREATE YOUR FIRST COURSE
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black py-10 text-white border-t-[3px] border-black pb-24 sm:pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-6 w-6 text-[#facc15]" />
            <span className="font-display font-bold text-2xl uppercase tracking-widest text-[#facc15]">
              CoursessionAI
            </span>
          </div>
          <p className="font-medium text-gray-400 uppercase tracking-widest text-sm">— Transform playlists into knowledge —</p>
        </div>
      </footer>
    </div>
  );
}
