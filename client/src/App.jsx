import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ClerkProvider } from '@clerk/react';
import { dark } from '@clerk/themes';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthSync from './components/AuthSync';
import { ToastProvider } from './components/Toast';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import PageLoader from './components/PageLoader';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseView = lazy(() => import('./pages/CourseView'));
const CourseSettings = lazy(() => import('./pages/CourseSettings'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicCertificate = lazy(() => import('./pages/PublicCertificate'));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required');
}

function ThemeAwareClerkProvider({ children }) {
  const { theme } = useTheme();

  return (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeAwareClerkProvider>
          <ToastProvider>
            <AuthSync>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/sign-in/*" element={<SignInPage />} />
                      <Route path="/sign-up/*" element={<SignUpPage />} />
                      <Route path="/certificates/public/:uid" element={<PublicCertificate />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/courses/:id"
                        element={
                          <ProtectedRoute>
                            <CourseView />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/courses/:id/settings"
                        element={
                          <ProtectedRoute>
                            <CourseSettings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthSync>
          </ToastProvider>
        </ThemeAwareClerkProvider>
      </ThemeProvider>
      <Analytics />
      <SpeedInsights />
    </QueryClientProvider>
  );
}
