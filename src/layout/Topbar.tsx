import { useState } from 'react';
import { useAuth } from '@/shared/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, ChevronDown, Bell, Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between border-b border-border
        bg-card px-4 sm:px-6 shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse-dot" />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] hidden sm:inline">
            System Operational
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg
            text-muted-foreground hover:text-foreground hover:bg-muted
            transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] ring-2 ring-card" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 rounded-xl
              border border-border bg-background pl-2 pr-3 py-1.5
              transition-all duration-200
              hover:border-accent/30 hover:shadow-sm"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg
                gradient-bg text-xs font-bold text-white shadow-[var(--shadow-accent)]"
            >
              {getInitials(user?.name || 'U')}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.role}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" aria-hidden onClick={() => setIsMenuOpen(false)} />
              <div
                className="absolute right-0 z-20 mt-2 w-56 overflow-hidden
                  rounded-xl bg-card border border-border shadow-lg py-1"
              >
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium
                    text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
