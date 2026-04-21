import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/react';
import { BookOpen, LayoutDashboard, User, Home, Menu, X, Sun, Moon } from 'lucide-react';
import StreakBadge from './StreakBadge';
import { useTheme } from './ThemeProvider';
import icon from '../assets/icon.png';

export default function AppLayout() {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname.startsWith(path);
  const isHome = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface font-sans transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3 transition-transform hover:-translate-y-0.5 duration-200">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all">
              <img src={icon} alt="Logo" className="h-full w-full object-cover dark:invert" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              Coursession<span className="text-primary group-hover:text-primary-dim transition-colors ml-0.5">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            {isSignedIn && (
              <>
                <StreakBadge />
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-xl border border-transparent ${
                    isActive('/dashboard')
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-xl border border-transparent ${
                    isActive('/profile')
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </>
            )}
            
            {/* Theme Toggle Button */}
            <button
              onClick={(e) => toggleTheme(e)}
              className="p-2 ml-1 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-all duration-300 transform active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="h-5 w-5 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {isSignedIn ? (
              <div className="ml-2 pl-4 border-l border-outline-variant/30 flex items-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9 border-2 border-outline/20 hover:border-primary transition-colors shadow-sm rounded-xl',
                    },
                  }}
                />
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="btn-primary px-5 py-2.5 text-sm ml-2"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            {isSignedIn && <StreakBadge />}
            
            <button
              onClick={(e) => toggleTheme(e)}
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-all duration-300"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isSignedIn ? (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
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
          <div className="sm:hidden border-t border-outline-variant/30 bg-surface-container-high px-4 py-4 space-y-2 shadow-xl animate-slide-up">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                isActive('/dashboard')
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                isActive('/profile')
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <User className="h-5 w-5" />
              Profile
            </Link>
            <div className="pt-4 mt-2 border-t border-outline-variant/30 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: { avatarBox: 'h-10 w-10 border border-outline/30 rounded-xl' },
                  }}
                />
                <span className="text-sm font-semibold text-on-surface">Account</span>
              </div>
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-surface/90 backdrop-blur-md border-t border-outline-variant pb-safe">
          <div className="flex items-center justify-around py-2 px-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-4 py-1.5 transition-all ${
                isHome ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Home className={`h-5 w-5 ${isHome && 'fill-primary/20'}`} />
              <span className="text-[10px] font-semibold tracking-wide mt-0.5">Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex flex-col items-center gap-1 px-4 py-1.5 transition-all ${
                isActive('/dashboard') || isActive('/courses') ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <LayoutDashboard className={`h-5 w-5 ${(isActive('/dashboard') || isActive('/courses')) && 'fill-primary/20'}`} />
              <span className="text-[10px] font-semibold tracking-wide mt-0.5">Courses</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center gap-1 px-4 py-1.5 transition-all ${
                isActive('/profile') ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <User className={`h-5 w-5 ${isActive('/profile') && 'fill-primary/20'}`} />
              <span className="text-[10px] font-semibold tracking-wide mt-0.5">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
