import { useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { NAVIGATION, type NavItem } from "@/config/navigation";
import { useUser } from "@/shared/UserContext";

interface MenuItemProps {
  item: NavItem;
  level?: number;
}

function MenuItem({ item, level = 0 }: MenuItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const userRole = user?.role?.toLowerCase() || "";

  const hasAccess = !item.roles || item.roles.includes(userRole);

  if (!hasAccess) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname === item.path;
  const hasActiveChild = item.children?.some(
    (child) => location.pathname === child.path
  );

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      navigate({ to: item.path });
    }
  };

  const activeClasses =
    isActive || (hasChildren && hasActiveChild)
      ? "bg-slate-800/90 text-white border-l-[3px] border-indigo-400"
      : "text-slate-300 border-l-[3px] border-transparent hover:bg-slate-800/60 hover:text-white";

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${activeClasses}`}
        style={{ paddingLeft: `${level * 12 + 16}px` }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{item.label}</span>
          {hasChildren && (
            <svg
              className={`w-4 h-4 shrink-0 opacity-70 transition-transform ${isOpen ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </button>
      {hasChildren && isOpen && (
        <div className="pb-1">
          {item.children!.map((child) => (
            <MenuItem key={child.path} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800/80 px-4 py-4">
        <div className="text-lg font-semibold tracking-tight text-white">Worksy ERP</div>
        <p className="mt-0.5 text-xs text-slate-500">Panel admin</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAVIGATION.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}
      </nav>
    </aside>
  );
}
