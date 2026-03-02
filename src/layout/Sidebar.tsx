import { useLocation, useNavigate } from "@tanstack/react-router";
import { NAVIGATION } from "@/config/navigation";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 shrink-0">
      <div className="p-4 text-xl font-bold border-b border-gray-700">ERP</div>
      <nav className="mt-4">
        {NAVIGATION.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate({ to: item.path })}
            className={`w-full text-left px-4 py-3 hover:bg-gray-800 ${
              location.pathname === item.path
                ? "bg-gray-800 border-l-4 border-blue-500"
                : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
