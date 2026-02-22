import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCategories } from "../services/categoryService";
import { getProgress, saveProgress } from "../services/progressService";
import { getWeekSurahs } from "../services/surahService";
import type { WeekSurahData } from "../services/surahService";
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

// Announcements carousel data
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
}

const ANNOUNCEMENTS: Announcement[] = [
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
  {
    id: "asma99",
    emoji: "✨",
    title: "Алланың 99 көркем есімі",
    desc: "Күн сайын 3 көркем есімді үйреніп, мағынасын терең ұғыныңыз",
    cta: "Бастау →",
    route: "/asma",
    gradient: "from-violet-600 to-purple-600",
    storageKey: "ann_asma_seen",
    animationData: announcementAnimation,
  },
  {
    id: "community",
    emoji: "🤝",
    title: "Қауымдастық",
    desc: "Барлық қолданушылардың жетістіктері мен прогресін бақылаңыз",
    cta: "Қарау →",
    route: "/community",
    gradient: "from-blue-600 to-cyan-600",
    storageKey: "ann_community_seen",
    animationData: announcementAnimation,
  },
];

// Ramadan 2026: Feb 18 – Mar 19
const RAMADAN_START = new Date(2026, 1, 19); // Feb 19, 2026

function getRamadanDay(): number {
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - RAMADAN_START.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0 || diff >= 30) return 0;
  return diff + 1;
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<Record<string, number | number[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [surah, setSurah] = useState<WeekSurahData | null>(null);
  const [newMembers, setNewMembers] = useState<NewMember[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const touchStartX = useRef(0);

  const today = new Date().toISOString().split("T")[0];
  const ramadanDay = getRamadanDay();
  const currentMember = newMembers[currentMemberIndex];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    // Load surah independently so it doesn't block main content
    getWeekSurahs()
      .then(setSurah)
      .catch(() => {});
    // Load new members
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
      // For FirstThreeNames: count how many names are fully learned (>= 33)
      const count = Array.isArray(rawCount)
        ? rawCount.filter((c) => c >= 33).length
        : rawCount;
      const newCount = count >= target ? 0 : target;

      setProgress({
        ...progress,
        [categoryId]: newCount,
      });

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-12 pb-8">
          <div className="h-4 w-24 bg-indigo-500 rounded mb-3 animate-pulse" />
          <div className="h-7 w-56 bg-indigo-500 rounded animate-pulse" />
          <div className="mt-4 bg-white bg-opacity-20 rounded-xl p-3">
            <div className="flex justify-between mb-2">
              <div className="h-4 w-20 bg-indigo-400 rounded animate-pulse" />
              <div className="h-4 w-10 bg-indigo-400 rounded animate-pulse" />
            </div>
            <div className="w-full bg-indigo-600 bg-opacity-30 rounded-full h-2 animate-pulse" />
          </div>
        </div>
        {/* Cards skeleton */}
        <div className="px-4 mt-3 flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse" />
              <div className="h-3 w-40 bg-gray-100 rounded mt-2 animate-pulse" />
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
      {/* New member toast */}
      {currentMember && (
        <Toast
          message="Тағы бір керемет адам бізбен бірге! 🎉"
          displayName={currentMember.displayName}
          onClose={handleNextMember}
        />
      )}

      {/* Header - Compact */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-bold">
              Қош келдіңіз, {user?.displayName}!
            </h1>
            <div className="text-indigo-200 text-xs flex items-center gap-1 mt-0.5">
              <span>Бүгін Рамазанның {ramadanDay}-күні</span>
              <Star size={12} fill="currentColor" />
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-2 bg-white bg-opacity-15 rounded-lg p-2">
            <div className="flex justify-between text-white text-xs mb-1">
              <span>Орындалған</span>
              <span className="font-bold">
                {completedCount}/{categories.length}
              </span>
            </div>
            <div className="w-full bg-indigo-600 bg-opacity-30 rounded-full h-1.5">
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

      {/* Announcements Carousel */}
      <div className="px-3 sm:px-4 mt-3 sm:mt-4">
        <div className="relative">
          {/* Carousel Card */}
          <div
            className="overflow-hidden rounded-2xl sm:rounded-3xl"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const touchEndX = e.changedTouches[0].clientX;
              const diff = touchStartX.current - touchEndX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) {
                  // Свайп влево → следующий
                  setCarouselIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
                } else {
                  // Свайп вправо → предыдущий
                  setCarouselIndex((prev) =>
                    prev === 0 ? ANNOUNCEMENTS.length - 1 : prev - 1,
                  );
                }
              }
            }}
          >
            <div className="relative">
              {ANNOUNCEMENTS.map((announcement, idx) => (
                <div
                  key={announcement.id}
                  className={`transition-all duration-500 ${
                    idx === carouselIndex ? "block" : "hidden"
                  }`}
                >
                  <div
                    className={`bg-gradient-to-br ${announcement.gradient} p-4 sm:p-6 text-white min-h-48 sm:min-h-60 flex flex-col justify-between rounded-2xl sm:rounded-3xl overflow-hidden relative`}
                  >
                    {/* Lottie Animation Background */}
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 ">
                      <Lottie
                        animationData={announcement.animationData}
                        loop
                        autoplay
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>

                    <div className="relative z-10">
                      <div className="text-3xl sm:text-5xl mb-2 sm:mb-3">
                        {announcement.emoji}
                      </div>
                      <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                        {announcement.title}
                      </h3>
                      <p className="text-white text-opacity-90 text-sm sm:text-base">
                        {announcement.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigate(announcement.route);
                        localStorage.setItem(announcement.storageKey, "true");
                      }}
                      className="bg-white text-gray-900 font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-base hover:bg-opacity-90 transition-all active:scale-95 self-start mt-3 sm:mt-4 relative z-10"
                    >
                      {announcement.cta}
                    </button>
                  </div>
                </div>
              ))}

              {/* Indicators */}
              <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {ANNOUNCEMENTS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      idx === carouselIndex
                        ? "bg-gray-800 w-6 sm:w-8"
                        : "bg-gray-300 w-1.5 sm:w-2 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Surah of the Week Card */}
      {surah && (
        <div className="px-4 mt-3">
          <button
            onClick={() => navigate("/surah")}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">
                  Апталық Сүре
                </span>
              </div>
              <span className="text-emerald-200 text-xs">
                {surah.members.filter((m) => m.surah?.learned).length} жаттады →
              </span>
            </div>
            <p className="text-white font-semibold mt-1">
              {surah.mySurah ? surah.mySurah.name : "Сүре таңдау →"}
            </p>
            {surah.mySurah?.learned && (
              <span className="text-xs text-emerald-100 mt-1 inline-block">
                ✓ Жаттадым деп белгіледің
              </span>
            )}
          </button>
        </div>
      )}

      {/* Categories Grid */}
      <div className="px-4 mt-3 flex flex-col gap-2">
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center mt-4 shadow-sm">
            <div className="flex justify-center mb-3">
              <Square size={48} className="text-gray-300" />
            </div>
            <p className="text-gray-700 font-medium">Категория жоқ</p>
            <p className="text-gray-400 text-sm mt-1">
              Админ әлі категория құрмағы
            </p>
          </div>
        ) : (
          categories.map((category) => {
            const rawCount = progress[category.id] || 0;
            // Handle both number (traditional categories) and array (FirstThreeNames)
            // For FirstThreeNames: count how many names are fully learned (>= 33)
            const count = Array.isArray(rawCount)
              ? rawCount.filter((c) => c >= 33).length
              : rawCount;
            const isDone = count >= category.target;
            const pct = Math.min((count / category.target) * 100, 100);

            return (
              <div
                key={category.id}
                className={`rounded-xl p-3 transition-all ${
                  isDone ? "bg-white border border-green-500" : "bg-white"
                }`}
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
                    className="flex-1 text-left hover:opacity-80 transition-opacity"
                  >
                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                  </button>
                  <button
                    onClick={(e) =>
                      handleToggleCheckbox(e, category.id, category.target)
                    }
                    className="ml-2 transition-transform active:scale-75"
                  >
                    {isDone ? (
                      <CheckCircle2 size={24} className="text-green-500" />
                    ) : (
                      <Square size={24} className="text-gray-300" />
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
                  className="w-full text-left hover:opacity-80 transition-opacity"
                >
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span
                        className={`font-semibold ${isDone ? "text-green-600" : "text-indigo-600"}`}
                      >
                        {count} / {category.target}
                      </span>
                      <span className="text-gray-500">{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isDone ? "bg-green-500" : "bg-indigo-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-xs line-clamp-1">
                      {category.meaning || ""}
                    </p>
                    <span className="text-indigo-600 text-lg">→</span>
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
