import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/react';
import { BookOpen, LayoutDashboard, User, Home, Menu, X } from 'lucide-react';
import StreakBadge from './StreakBadge';

export default function AppLayout() {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);
  const isHome = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-2xl transition-all duration-300" style={{ backgroundColor: 'rgba(10, 10, 15, 0.7)' }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5 transition-transform hover:scale-105 duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-colors border border-amber-500/10">
              <BookOpen className="h-5 w-5 text-amber-400 group-hover:text-orange-400 transition-colors" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gradient">Coursession</span>
              <span className="text-gray-400 font-semibold group-hover:text-white transition-colors">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            {isSignedIn && (
              <>
                <StreakBadge />
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive('/profile')
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </>
            )}
            {isSignedIn ? (
              <div className="ml-2 pl-3 border-l border-white/10 flex items-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9 border-2 border-white/10 hover:border-amber-500/50 transition-colors',
                    },
                  }}
                />
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="btn-primary px-5 py-2.5"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            {isSignedIn && <StreakBadge />}
            {isSignedIn ? (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            ) : (
              <Link to="/sign-in" className="btn-primary px-4 py-2 text-xs">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && isSignedIn && (
          <div className="sm:hidden border-t border-white/[0.06] px-4 py-3 space-y-1 animate-fade-in" style={{ backgroundColor: 'rgba(10, 10, 15, 0.95)' }}>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive('/profile')
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <div className="pt-2 px-4 flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: { avatarBox: 'h-8 w-8 border-2 border-white/10' },
                }}
              />
              <span className="text-sm text-gray-400">Account</span>
            </div>
          </div>
        )}

        {/* Subtle bottom gradient line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent absolute bottom-0" />
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom navigation bar */}
      {isSignedIn && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-white/[0.06] backdrop-blur-2xl" style={{ backgroundColor: 'rgba(10, 10, 15, 0.9)' }}>
          <div className="flex items-center justify-around py-2 px-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                isHome ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                isActive('/dashboard') || isActive('/courses') ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-medium">Courses</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                isActive('/profile') ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
