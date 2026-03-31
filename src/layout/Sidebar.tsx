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

  // Check if user has access to this menu item
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

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${
          isActive || (hasChildren && hasActiveChild)
            ? "bg-gray-800 border-l-4 border-blue-500"
            : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 16}px` }}
      >
        <div className="flex items-center justify-between">
          <span>{item.label}</span>
          {hasChildren && (
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
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
        <div>
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
    <aside className="w-64 bg-gray-900 text-gray-100 shrink-0">
      <div className="p-4 text-xl font-bold border-b border-gray-700">ERP</div>
      <nav className="mt-4">
        {NAVIGATION.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}
      </nav>
    </aside>
  );
}
