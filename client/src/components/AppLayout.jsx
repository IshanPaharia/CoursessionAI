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
    <div className="flex min-h-screen flex-col bg-[#facc15] text-black font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b-[3px] border-black transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5 transition-transform hover:-translate-y-1 duration-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#facc15] border-[2px] border-black brutal-shadow-sm group-hover:bg-[#ff99e6] transition-colors">
              <BookOpen className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight uppercase">
              Coursession
              <span className="text-[#ff8c00] font-black group-hover:text-[#ff99e6] transition-colors ml-1">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            {isSignedIn && (
              <>
                <StreakBadge />
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-200 border-[2px] border-black ${
                    isActive('/dashboard')
                      ? 'bg-[#ff99e6] brutal-shadow-sm -translate-y-[2px] -translate-x-[2px]'
                      : 'bg-white hover:bg-black/5 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-200 border-[2px] border-black ${
                    isActive('/profile')
                      ? 'bg-[#ff99e6] brutal-shadow-sm -translate-y-[2px] -translate-x-[2px]'
                      : 'bg-white hover:bg-black/5 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </>
            )}
            {isSignedIn ? (
              <div className="ml-2 pl-3 border-l-[3px] border-black flex items-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9 border-[2px] border-black hover:scale-110 transition-transform brutal-shadow-sm rounded-none',
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
                className="p-2 text-black hover:bg-[#ff99e6] border-[2px] border-black brutal-shadow-sm transition-all"
              >
                {mobileMenuOpen ? <X className="h-5 w-5 stroke-[3px]" /> : <Menu className="h-5 w-5 stroke-[3px]" />}
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
          <div className="sm:hidden border-t-[3px] border-black bg-white px-4 py-3 space-y-2 animate-fade-in">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase border-[2px] border-black transition-all ${
                isActive('/dashboard')
                  ? 'bg-[#ff99e6] brutal-shadow-sm'
                  : 'bg-white hover:bg-black/5'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase border-[2px] border-black transition-all ${
                isActive('/profile')
                  ? 'bg-[#ff99e6] brutal-shadow-sm'
                  : 'bg-white hover:bg-black/5'
              }`}
            >
              <User className="h-5 w-5" />
              Profile
            </Link>
            <div className="pt-2 px-4 flex items-center gap-3 border-t-[2px] border-black mt-2">
              <UserButton
                appearance={{
                  elements: { avatarBox: 'h-10 w-10 border-[2px] border-black rounded-none brutal-shadow-sm' },
                }}
              />
              <span className="text-sm font-bold uppercase">Account</span>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom navigation bar */}
      {isSignedIn && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t-[3px] border-black bg-white">
          <div className="flex items-center justify-around py-2 px-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-all ${
                isHome ? 'text-[#ff8c00]' : 'text-black hover:text-[#ff8c00]'
              }`}
            >
              <Home className={`h-6 w-6 stroke-[3px] ${isHome && 'fill-[#ff8c00]/20'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-all ${
                isActive('/dashboard') || isActive('/courses') ? 'text-[#ff8c00]' : 'text-black hover:text-[#ff8c00]'
              }`}
            >
              <LayoutDashboard className={`h-6 w-6 stroke-[3px] ${(isActive('/dashboard') || isActive('/courses')) && 'fill-[#ff8c00]/20'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Courses</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-all ${
                isActive('/profile') ? 'text-[#ff8c00]' : 'text-black hover:text-[#ff8c00]'
              }`}
            >
              <User className={`h-6 w-6 stroke-[3px] ${isActive('/profile') && 'fill-[#ff8c00]/20'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
