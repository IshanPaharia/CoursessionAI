import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/react';
import { BookOpen, LayoutDashboard, User } from 'lucide-react';
import StreakBadge from './StreakBadge';

export default function AppLayout() {
  const { isSignedIn } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050508]/60 backdrop-blur-2xl transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2 transition-transform hover:scale-105 duration-300">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
              <BookOpen className="h-5 w-5 text-purple-400 group-hover:text-pink-400 transition-colors" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gradient">
                Coursession
              </span>
              <span className="text-gray-400 font-semibold group-hover:text-white transition-colors">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {isSignedIn && (
              <>
                <StreakBadge />
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive('/profile')
                      ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              </>
            )}
            {isSignedIn ? (
              <div className="ml-2 pl-4 border-l border-white/10 flex items-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9 border-2 border-white/10 hover:border-purple-500/50 transition-colors',
                    },
                  }}
                />
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105 hover:shadow-purple-500/40 hover:from-purple-400 hover:to-pink-400"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent absolute bottom-0"></div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
