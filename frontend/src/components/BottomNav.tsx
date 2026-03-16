import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Home, Settings, User, Heart, BookOpen, Brain } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.user?.isAdmin);

  const tabs = [
    { path: "/kadir-night", icon: Home, label: "Басты бет" },
    { path: "/community", icon: Heart, label: "Топ" },
    { path: "/quiz", icon: Brain, label: "Куиз" },
    { path: "/asma", icon: BookOpen, label: "Есімдер" },
    ...(isAdmin ? [{ path: "/admin", icon: Settings, label: "Админ" }] : []),
    { path: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb"
      style={{
        background: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors relative ${
                isActive ? "text-white" : "text-white/80"
              }`}
            >
              <tab.icon size={22} />
              <span
                className={`text-xs font-medium ${isActive ? "text-white" : "text-white/40"}`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
