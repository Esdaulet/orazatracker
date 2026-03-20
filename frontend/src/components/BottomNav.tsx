import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Home, Settings, User, Heart, BookOpen, Brain, X } from "lucide-react";
import { useState } from "react";

const TG_CHANNEL = "https://t.me/+gAiqagw5YD05NWUy";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.user?.isAdmin);
  const [showTgPopover, setShowTgPopover] = useState(false);

  const tabs = [
    { path: "/dashboard", icon: Home, label: "Басты бет" },
    { path: "/community", icon: Heart, label: "Топ" },
    { path: "/quiz", icon: Brain, label: "Куиз" },
    { path: "/asma", icon: BookOpen, label: "Есімдер" },
    ...(isAdmin ? [{ path: "/admin", icon: Settings, label: "Админ" }] : []),
    { path: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <>
      {/* Telegram popover */}
      {showTgPopover && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowTgPopover(false)}
          />
          <div
            className="fixed bottom-24 right-4 z-50 w-64 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10,10,20,0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(42,171,238,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="p-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(42,171,238,0.25), rgba(34,158,217,0.15))",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={22}
                    height={22}
                    viewBox="0 0 256 256"
                  >
                    <defs>
                      <linearGradient
                        id="tgGrad2"
                        x1="50%"
                        x2="50%"
                        y1="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#2aabee" />
                        <stop offset="100%" stopColor="#229ed9" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#tgGrad2)"
                      d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.04 128.04 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51s-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0"
                    />
                    <path
                      fill="#fff"
                      d="M57.94 126.648q55.98-24.384 74.64-32.152c35.56-14.786 42.94-17.354 47.76-17.441c1.06-.017 3.42.245 4.96 1.49c1.28 1.05 1.64 2.47 1.82 3.467c.16.996.38 3.266.2 5.038c-1.92 20.24-10.26 69.356-14.5 92.026c-1.78 9.592-5.32 12.808-8.74 13.122c-7.44.684-13.08-4.912-20.28-9.63c-11.26-7.386-17.62-11.982-28.56-19.188c-12.64-8.328-4.44-12.906 2.76-20.386c1.88-1.958 34.64-31.748 35.26-34.45c.08-.338.16-1.598-.6-2.262c-.74-.666-1.84-.438-2.64-.258c-1.14.256-19.12 12.152-54 35.686c-5.1 3.508-9.72 5.218-13.88 5.128c-4.56-.098-13.36-2.584-19.9-4.708c-8-2.606-14.38-3.984-13.82-8.41c.28-2.304 3.46-4.662 9.52-7.072"
                      strokeWidth={6.5}
                      stroke="#fff"
                    />
                  </svg>

                  <span className="text-white font-bold text-sm">
                    Telegram канал
                  </span>
                </div>

                <button
                  onClick={() => setShowTgPopover(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-white/60 text-xs mt-2 leading-relaxed">
                Жаңалықтар, хабарландырулар және қауымдастықпен байланыс —
                барлығы осы каналда.
              </p>
            </div>

            <div className="p-3">
              <a
                href={TG_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowTgPopover(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #2aabee, #229ed9)",
                }}
              >
                Каналға өту →
              </a>
            </div>
          </div>
        </>
      )}

      {/* Telegram button */}
      <button
        onClick={() => setShowTgPopover((v) => !v)}
        className="fixed bottom-20 right-4 z-50 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{
          background: "linear-gradient(135deg, #227cad, #229ed9)",
          boxShadow: "0 4px 16px rgba(34,158,217,0.5)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 256 256"
        >
          <path
            fill="rgba(255,255,255,0.25)"
            d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.04 128.04 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51s-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0"
          />
          <path
            fill="#fff"
            d="M57.94 126.648q55.98-24.384 74.64-32.152c35.56-14.786 42.94-17.354 47.76-17.441c1.06-.017 3.42.245 4.96 1.49c1.28 1.05 1.64 2.47 1.82 3.467c.16.996.38 3.266.2 5.038c-1.92 20.24-10.26 69.356-14.5 92.026c-1.78 9.592-5.32 12.808-8.74 13.122c-7.44.684-13.08-4.912-20.28-9.63c-11.26-7.386-17.62-11.982-28.56-19.188c-12.64-8.328-4.44-12.906 2.76-20.386c1.88-1.958 34.64-31.748 35.26-34.45c.08-.338.16-1.598-.6-2.262c-.74-.666-1.84-.438-2.64-.258c-1.14.256-19.12 12.152-54 35.686c-5.1 3.508-9.72 5.218-13.88 5.128c-4.56-.098-13.36-2.584-19.9-4.708c-8-2.606-14.38-3.984-13.82-8.41c.28-2.304 3.46-4.662 9.52-7.072"
            strokeWidth={6.5}
            stroke="#fff"
          />
        </svg>
      </button>

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
    </>
  );
}
