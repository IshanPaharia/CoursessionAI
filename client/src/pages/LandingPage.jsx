import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ArrowRight, Play, BookOpen, BarChart3, Sparkles, Layers, Bookmark, Zap, GraduationCap, Users } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="w-full min-h-screen pb-16 sm:pb-0 relative bg-background">

      {/* Hero Section */}
      <section className="relative w-full pt-28 sm:pt-40 pb-20 px-4 sm:px-6 z-10">
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline text-primary text-sm font-semibold mb-8 animate-slide-up">
            <Sparkles className="h-4 w-4" />
            <span>The World's Most Advanced AI Tutor</span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl leading-[1.1] tracking-tight mb-8 max-w-5xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Instantly generate courses tailored to your <span className="text-secondary">curiosity.</span>
          </h1>
          
          <p className="max-w-2xl text-lg sm:text-xl text-on-surface-variant leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Transform any topic into a complete learning journey in seconds. Your personalized path to mastery, architected by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link
              to={isSignedIn ? '/dashboard' : '/sign-up'}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Learning Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary text-lg px-8 py-4"
            >
              <Play className="h-5 w-5 text-primary fill-primary/20" />
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative w-full py-24 sm:py-32 px-4 sm:px-6 z-10 border-t border-outline-variant bg-surface-container">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Three Steps To Mastery
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              We eliminated the friction of learning something new. From prompt to curriculum in less than a minute.
            </p>
          </div>
          
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto relative">

            {[
              { step: '01', title: 'Input Goal', desc: 'Describe what you want to learn. From quantum physics to sourdough baking, no topic is too niche.', icon: Zap },
              { step: '02', title: 'AI Generation', desc: 'Our engine curates and crafts a bespoke curriculum including interactive video scripts and quizzes.', icon: Layers },
              { step: '03', title: 'Learn & Adapt', desc: 'Interactive modules adapt to your progress. Built-in smart summaries keep you on track.', icon: BookOpen },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="learning-card relative group flex flex-col items-center text-center mt-10 md:mt-0">
                <div className="absolute -top-10 z-10 h-20 w-20 rounded-full bg-background border-4 border-surface flex items-center justify-center transition-transform duration-300">
                  <Icon className="h-8 w-8 text-primary" />
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

      {/* Real Stories / Testimonials */}
      <section className="relative w-full py-24 sm:py-32 px-4 sm:px-6 z-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Loved by Scholars
              </h2>
              <p className="text-on-surface-variant text-lg">
                Real stories from the front lines of the AI education revolution.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-on-surface font-semibold border-b border-on-surface pb-1">
              <Users className="h-5 w-5" />
              <span>Join 10,000+ Luminous Scholars</span>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {[
              {
                quote: "CoursessionAI turned my fragmented notes into a structured 4-week masters-level curriculum. It's like having a personalized professor available 24/7.",
                author: "Alex Rivera",
                role: "Computer Science Student"
              },
              {
                quote: "The visual learning aids the AI generates are stunning. I finally understand molecular biology because I can 'see' the concepts unfold.",
                author: "Sarah Chen",
                role: "Pre-med Candidate"
              },
              {
                quote: "I learned the fundamentals of Game Theory in a single weekend. The AI Tutor's ability to simplify complex logic is actually unbelievable.",
                author: "Marcus Thorne",
                role: "Economics Enthusiast"
              }
            ].map(({ quote, author, role }, idx) => (
              <div key={idx} className="bg-surface p-8 border border-outline-variant hover:border-outline transition-colors">
                <div className="flex gap-1 mb-6 text-on-surface">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-on-surface text-lg leading-relaxed mb-8">"{quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center bg-primary text-on-primary font-bold text-sm">
                    {author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{author}</h4>
                    <p className="text-sm text-on-surface-variant">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Layer */}
      <section className="relative w-full py-24 px-4 sm:px-6 z-10 border-t border-outline-variant">
        <div className="mx-auto max-w-4xl">
          <div className="learning-card text-center bg-surface-container relative">
            <GraduationCap className="h-12 w-12 mx-auto text-primary mb-6" />
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Ready to become a <br className="hidden sm:block" />
              <span className="text-secondary">Luminous Scholar?</span>
            </h2>
            <p className="text-xl text-on-surface-variant mb-10 max-w-xl mx-auto">
              Join thousands of learners transforming their curiosity into structured knowledge.
            </p>
            <Link
              to={isSignedIn ? '/dashboard' : '/sign-up'}
              className="btn-primary text-lg px-8 py-4 w-full sm:w-auto relative z-10"
            >
              Create Your First Course Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-surface border-t border-outline-variant py-12 text-on-surface-variant">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-xl tracking-tight text-on-surface">
              CoursessionAI
            </span>
          </div>
          <p className="font-medium text-sm">© 2024 CoursessionAI. Designed for The Luminous Scholar.</p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Student Resources</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
