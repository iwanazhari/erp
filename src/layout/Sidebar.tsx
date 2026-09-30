import { useState, type ComponentType } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { NAVIGATION, type NavItem } from "@/config/navigation";
import { useUser } from "@/shared/UserContext";
import { useAuth } from "@/shared/AuthContext";
import * as Icons from "lucide-react";
import { ChevronLeft, X } from "lucide-react";

// ponytail: per-user email allowlist for "schedule menu only" access
// ponytail: schedule-only — finance01 & pm01 cuma bisa akses /schedule
const SCHEDULE_ONLY_EMAILS = new Set<string>([
  'finance01@waterpromandiri.com',
  'projectmanager01@waterpromandiri.com',
  'creator01@waterpromandiri.com',
]);

const iconCache = new Map<string, ComponentType<{ className?: string }>>();

function getIcon(name: string): ComponentType<{ className?: string }> {
  if (!iconCache.has(name)) {
    const icon = (Icons as any)[name] || Icons.HelpCircle;
    iconCache.set(name, icon);
  }
  return iconCache.get(name)!;
}

interface MenuItemProps {
  item: NavItem;
  level?: number;
  collapsed?: boolean;
  onNavigate?: () => void;
  roleOverride?: string;
}

function MenuItem({ item, level = 0, collapsed = false, onNavigate, roleOverride }: MenuItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const Icon = getIcon(item.icon);

  const userRole = roleOverride || user?.role?.toLowerCase() || "";
  const hasAccess = !item.roles || item.roles.includes(userRole);
  if (!hasAccess) return null;

  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname === item.path;
  const hasActiveChild = item.children?.some(
    (child) => location.pathname === child.path
  );

  const handleClick = () => {
    if (hasChildren && !collapsed) {
      setIsOpen(!isOpen);
    } else if (collapsed && hasChildren) {
      if (item.path) navigate({ to: item.path });
    } else {
      navigate({ to: item.path });
      onNavigate?.();
    }
  };

  const activeClasses = isActive || (hasChildren && hasActiveChild)
    ? "bg-accent/10 text-[var(--color-accent)] border-l-[3px] border-[var(--color-accent)] font-semibold"
    : "text-muted-foreground border-l-[3px] border-transparent hover:bg-muted/50 hover:text-foreground";

  if (collapsed) {
    return (
      <div className="group relative flex items-center justify-center py-2">
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${(isActive || hasActiveChild) ? 'bg-accent/10 text-[var(--color-accent)]' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          title={item.label}
        >
          <Icon className="h-5 w-5" />
        </button>
        <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg">
          {item.label}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 flex items-center gap-3 ${activeClasses}`}
        style={{ paddingLeft: `${level * 12 + 16}px` }}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {hasChildren && (
          <Icons.ChevronRight
            className={`h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          />
        )}
      </button>
      {hasChildren && isOpen && (
        <div className="pb-1">
          {item.children!.map((child) => (
            <MenuItem key={child.path} item={child} level={level + 1} collapsed={collapsed} onNavigate={onNavigate} roleOverride={roleOverride} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user: authUser } = useAuth();

  const authEmail = authUser?.email?.toLowerCase() || "";
  const scheduleOnly = SCHEDULE_ONLY_EMAILS.has(authEmail);
  const roleOverride = scheduleOnly ? authUser?.role?.toLowerCase() : undefined;

  // ponytail: schedule-only users cuma lihat Technician Schedule at /schedule
  const visibleNav = scheduleOnly
    ? NAVIGATION.filter((item) => item.path === "/schedule")
    : NAVIGATION;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          flex shrink-0 flex-col bg-card border-r border-border transition-all duration-300
          lg:relative lg:z-auto
          fixed inset-y-0 left-0 z-50 lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        {/* Mobile close button */}
        <div className={`flex items-center border-b border-border ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-4"}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-bg shadow-[var(--shadow-accent)]">
            <Icons.LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="text-base font-display text-foreground leading-tight">Waterpro</div>
                <p className="text-[11px] font-mono font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  HRIS
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {visibleNav.map((item) => (
            <MenuItem key={item.path} item={item} collapsed={collapsed} onNavigate={onClose} roleOverride={roleOverride} />
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-muted/50 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
