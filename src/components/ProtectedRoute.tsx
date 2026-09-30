import { useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/shared/AuthContext';

// ponytail: schedule-only — finance01 & pm01 cuma bisa akses /schedule, di luar itu redirect ke /schedule
const SCHEDULE_ONLY_EMAILS = new Set<string>([
  'finance01@waterpromandiri.com',
  'projectmanager01@waterpromandiri.com',
  'creator01@waterpromandiri.com',
]);

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = user?.email?.toLowerCase() || '';
  const scheduleOnly = SCHEDULE_ONLY_EMAILS.has(email);
  const onSchedule = location.pathname === '/schedule';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (location.pathname === '/login' || location.pathname === '/register') {
        return;
      }
      navigate({ to: '/login' });
      return;
    }

    if (scheduleOnly && !onSchedule) {
      navigate({ to: '/schedule' });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, scheduleOnly, onSchedule, user?.role]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null while redirecting or on public routes
  return null;
}
