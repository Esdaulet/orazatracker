import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Home, Clock, Settings, User, Heart, BookOpen } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.user?.isAdmin);

  const tabs = [
    { path: "/dashboard", icon: Home, label: "Басты бет" },
    { path: "/community", icon: Heart, label: "Топ" },
    { path: "/schedule", icon: Clock, label: "Күнтізбе" },
    { path: "/asma", icon: BookOpen, label: "Есімдер" },
    ...(isAdmin ? [{ path: "/admin", icon: Settings, label: "Админ" }] : []),
    { path: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <tab.icon size={24} />
              <span
                className={`text-xs font-medium ${isActive ? "text-indigo-600" : "text-gray-400"}`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
