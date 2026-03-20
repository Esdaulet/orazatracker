import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCategories } from "../services/categoryService";
import { getProgress, saveProgress } from "../services/progressService";
import {
  getUnseenNewMembers,
  markMemberAsSeen,
} from "../services/newMembersService";
import type { NewMember } from "../services/newMembersService";
import BottomNav from "../components/BottomNav";
import Toast from "../components/Toast";
import { Star, CheckCircle2, Square } from "lucide-react";
import Lottie from "lottie-react";
import referralAnimation from "../assets/referal.json";
import announcementAnimation from "../assets/annons.json";
import type { Category } from "../types";

interface Announcement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  cta: string;
  route: string;
  gradient: string;
  storageKey: string;
  animationData: object;
  external?: boolean;
}

const getAnnouncements = (): Announcement[] => [
  {
    id: "telegram",
    emoji: "📣",
    title: "Telegram каналына қосылыңыз!",
    desc: "Жаңалықтар, хабарландырулар және қауымдастық — бәрі осында",
    cta: "Каналға өту →",
    route: "https://t.me/+gAiqagw5YD05NWUy",
    gradient: "from-sky-500 to-blue-600",
    storageKey: "ann_telegram_seen",
    animationData: announcementAnimation,
    external: true,
  },
  {
    id: "sprint",
    emoji: "⚡",
    title: "Апталық спринт басталды!",
    desc: "Осы аптада ең көп күн орындаған ким? Рейтингке кір!",
    cta: "Спринтке өту →",
    route: "/community",
    gradient: "from-yellow-500 to-orange-500",
    storageKey: "ann_sprint_seen",
    animationData: announcementAnimation,
  },
  {
    id: "ramadan_results",
    emoji: "🌙",
    title: "Сіздің Рамазаныңыз 2026",
    desc: "Жетістіктеріңіз бен үздіктер",
    cta: "Ашу →",
    route: "/ramadan-results",
    gradient: "from-violet-800 to-purple-900",
    storageKey: "ann_ramadan_results_seen",
    animationData: announcementAnimation,
  },

  {
    id: "quiz",
    emoji: "🧠",
    title: "Жаңа! Куиз ойыны",
    desc: "Үйренген есімдерді тексеріп, білімді нығайтыңыз",
    cta: "Куизді бастау →",
    route: "/quiz",
    gradient: "from-green-500 to-teal-600",
    storageKey: "ann_quiz_seen",
    animationData: announcementAnimation,
  },
  {
    id: "leaderboard",
    emoji: "🏆",
    title: "Жаңа! Рейтинг кестесі",
    desc: "Есімдер, марафон және квиз бойынша кім озып жатыр?",
    cta: "Рейтингке өту →",
    route: "/community",
    gradient: "from-amber-500 to-orange-600",
    storageKey: "ann_leaderboard_seen",
    animationData: announcementAnimation,
  },
  {
    id: "referral",
    emoji: "📿",
    title: "Сауап дәптері",
    desc: "Достарыңызды шақырып, игі іске себепкер болыңыз",
    cta: "Профильге өту →",
    route: "/profile",
    gradient: "from-purple-600 to-indigo-600",
    storageKey: "ann_referral_seen",
    animationData: referralAnimation,
  },
];

const BG_STYLE = {
  backgroundImage: "url('/masjid1.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const glass = {
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.18)",
};

const glassDark = {
  background: "rgba(0,0,0,0.25)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.12)",
};

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<Record<string, number | number[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [newMembers, setNewMembers] = useState<NewMember[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const touchStartX = useRef(0);

  const today = new Date().toISOString().split("T")[0];
  const currentMember = newMembers[currentMemberIndex];
  const announcements = getAnnouncements();

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [catData, progData] = await Promise.all([
        getCategories(),
        getProgress(today),
      ]);
      setCategories(catData.sort((a, b) => a.order - b.order));
      setProgress(progData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadData();
    getUnseenNewMembers()
      .then(setNewMembers)
      .catch(() => {});
  }, [user, navigate, loadData]);

  const handleNextMember = async () => {
    if (currentMember) {
      await markMemberAsSeen(currentMember.userId);
    }
    if (currentMemberIndex < newMembers.length - 1) {
      setCurrentMemberIndex(currentMemberIndex + 1);
    } else {
      setNewMembers([]);
      setCurrentMemberIndex(0);
    }
  };

  const completedCount = categories.filter((c) => {
    const rawCount = progress[c.id] || 0;
    const count = Array.isArray(rawCount)
      ? rawCount.filter((x) => x >= 33).length
      : rawCount;
    return count >= c.target;
  }).length;

  const handleToggleCheckbox = useCallback(
    async (e: React.MouseEvent, categoryId: string, target: number) => {
      e.stopPropagation();
      const rawCount = progress[categoryId] || 0;
      const count = Array.isArray(rawCount)
        ? rawCount.filter((c) => c >= 33).length
        : rawCount;
      const newCount = count >= target ? 0 : target;
      setProgress({ ...progress, [categoryId]: newCount });
      try {
        await saveProgress(today, categoryId, newCount);
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    },
    [progress, today],
  );

  if (loading) {
    return (
      <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4 pt-12 pb-4">
          <div className="h-4 w-24 bg-white/20 rounded mb-2 animate-pulse" />
          <div className="h-7 w-56 bg-white/20 rounded animate-pulse" />
          <div className="mt-3 rounded-xl p-3" style={glass}>
            <div className="h-3 w-full bg-white/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="relative z-10 px-4 flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl p-4" style={glass}>
              <div className="h-5 w-32 bg-white/20 rounded animate-pulse mb-3" />
              <div className="h-2 w-full bg-white/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
      <div className="absolute inset-0 bg-black/50" />

      {/* Toast */}
      {currentMember && (
        <Toast
          message="Тағы бір керемет адам бізбен бірге! 🎉"
          displayName={currentMember.displayName}
          onClose={handleNextMember}
        />
      )}

      {/* Header */}
      <div className="relative z-10 px-4 pt-10 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white text-xl font-bold">
              Қош келдіңіз, {user?.displayName}!
            </h1>
            <div className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
              <span>Амалдарыңызды жалғастырыңыз</span>
              <Star size={11} fill="currentColor" />
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="rounded-xl p-3" style={glass}>
            <div className="flex justify-between text-white text-xs mb-2">
              <span className="text-white/70">Бүгінгі амалдар</span>
              <span className="font-bold">
                {completedCount}/{categories.length}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${categories.length ? (completedCount / categories.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="relative z-10 px-3 mb-3">
        <div
          className="overflow-hidden rounded-2xl"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
              setCarouselIndex((prev) =>
                diff > 0
                  ? (prev + 1) % announcements.length
                  : prev === 0
                    ? announcements.length - 1
                    : prev - 1,
              );
            }
          }}
        >
          {announcements.map((ann, idx) => (
            <div
              key={ann.id}
              className={idx === carouselIndex ? "block" : "hidden"}
            >
              <div
                className="p-4 text-white min-h-44 flex flex-col justify-between rounded-2xl relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-100">
                  <Lottie
                    animationData={ann.animationData}
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                <div className="relative z-10">
                  <div className="text-3xl mb-2">
                    {ann.id === "telegram" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width={36} height={36} viewBox="0 0 256 256">
                        <defs>
                          <linearGradient id="tgBanner" x1="50%" x2="50%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#2aabee" />
                            <stop offset="100%" stopColor="#229ed9" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#tgBanner)" d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.04 128.04 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51s-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0" />
                        <path fill="#fff" d="M57.94 126.648q55.98-24.384 74.64-32.152c35.56-14.786 42.94-17.354 47.76-17.441c1.06-.017 3.42.245 4.96 1.49c1.28 1.05 1.64 2.47 1.82 3.467c.16.996.38 3.266.2 5.038c-1.92 20.24-10.26 69.356-14.5 92.026c-1.78 9.592-5.32 12.808-8.74 13.122c-7.44.684-13.08-4.912-20.28-9.63c-11.26-7.386-17.62-11.982-28.56-19.188c-12.64-8.328-4.44-12.906 2.76-20.386c1.88-1.958 34.64-31.748 35.26-34.45c.08-.338.16-1.598-.6-2.262c-.74-.666-1.84-.438-2.64-.258c-1.14.256-19.12 12.152-54 35.686c-5.1 3.508-9.72 5.218-13.88 5.128c-4.56-.098-13.36-2.584-19.9-4.708c-8-2.606-14.38-3.984-13.82-8.41c.28-2.304 3.46-4.662 9.52-7.072" strokeWidth={6.5} stroke="#fff" />
                      </svg>
                    ) : ann.emoji}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{ann.title}</h3>
                  <p className="text-white/70 text-sm">{ann.desc}</p>
                </div>
                <button
                  onClick={() => {
                    if (ann.id === "ramadan_results") {
                      localStorage.removeItem("ramadan2026_results_seen");
                    }
                    if (ann.external) {
                      window.open(ann.route, "_blank", "noopener,noreferrer");
                    } else if (ann.id === "sprint") {
                      navigate(ann.route, { state: { tab: "sprint" } });
                    } else {
                      navigate(ann.route);
                    }
                    localStorage.setItem(ann.storageKey, "true");
                  }}
                  className="bg-white/20 text-white font-bold py-1.5 px-4 rounded-lg text-sm hover:bg-white/30 transition-all active:scale-95 self-start mt-3 relative z-10 border border-white/30"
                >
                  {ann.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 mt-2">
          {announcements.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCarouselIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === carouselIndex ? "bg-white w-6" : "bg-white/40 w-1.5"}`}
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="relative z-10 px-4 flex flex-col gap-2">
        {categories.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={glass}>
            <Square size={40} className="text-white/30 mx-auto mb-3" />
            <p className="text-white font-medium">Категория жоқ</p>
            <p className="text-white/50 text-sm mt-1">
              Админ әлі категория құрмағы
            </p>
          </div>
        ) : (
          categories.map((category) => {
            const rawCount = progress[category.id] || 0;
            const count = Array.isArray(rawCount)
              ? rawCount.filter((c) => c >= 33).length
              : rawCount;
            const isDone = count >= category.target;
            const pct = Math.min((count / category.target) * 100, 100);

            return (
              <div
                key={category.id}
                className="rounded-xl p-3 transition-all"
                style={
                  isDone
                    ? {
                        background: "rgba(34,197,94,0.15)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(34,197,94,0.35)",
                      }
                    : glassDark
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => {
                      const path =
                        category.target === 3 && category.name.includes("есімі")
                          ? `/names/${category.id}`
                          : `/counter/${category.id}`;
                      navigate(path);
                    }}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-bold text-white">{category.name}</h3>
                  </button>
                  <button
                    onClick={(e) =>
                      handleToggleCheckbox(e, category.id, category.target)
                    }
                    className="ml-2 transition-transform active:scale-75"
                  >
                    {isDone ? (
                      <CheckCircle2 size={24} className="text-green-400" />
                    ) : (
                      <Square size={24} className="text-white/40" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => {
                    const path =
                      category.target === 3 && category.name.includes("есімі")
                        ? `/names/${category.id}`
                        : `/counter/${category.id}`;
                    navigate(path);
                  }}
                  className="w-full text-left"
                >
                  <div className="mb-1.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span
                        className={`font-semibold ${isDone ? "text-green-400" : "text-white/70"}`}
                      >
                        {count} / {category.target}
                      </span>
                      <span className="text-white/50">{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${isDone ? "bg-green-400" : "bg-white"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white text-xs line-clamp-1">
                      {category.meaning || ""}
                    </p>
                    <span className="text-white/60 text-base">→</span>
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
