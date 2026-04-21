import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthSync from './components/AuthSync';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeProvider';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import PageLoader from './components/PageLoader';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseView = lazy(() => import('./pages/CourseView'));
const CourseSettings = lazy(() => import('./pages/CourseSettings'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthSync>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/sign-in/*" element={<SignInPage />} />
                    <Route path="/sign-up/*" element={<SignUpPage />} />
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}
