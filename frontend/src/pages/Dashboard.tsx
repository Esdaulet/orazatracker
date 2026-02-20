import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCategories } from "../services/categoryService";
import { getProgress, saveProgress } from "../services/progressService";
import BottomNav from "../components/BottomNav";
import { Star, CheckCircle2, Square } from "lucide-react";
import type { Category } from "../types";

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
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const ramadanDay = getRamadanDay();

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
  }, [user, navigate, loadData]);

  // Refresh data when user returns to dashboard
  useEffect(() => {
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, [loadData]);

  const completedCount = categories.filter(
    (c) => (progress[c.id] || 0) >= c.target,
  ).length;

  const handleToggleCheckbox = useCallback(
    async (e: React.MouseEvent, categoryId: string, target: number) => {
      e.stopPropagation();
      const count = progress[categoryId] || 0;
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
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-indigo-200 text-sm flex items-center gap-1">
              <span>Бүгін {ramadanDay} күн</span>
              <Star size={16} fill="currentColor" />
            </div>
            <h1 className="text-white text-2xl font-bold mt-1">
              Ассаламуалейкум, {user?.displayName}!
            </h1>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-4 bg-white bg-opacity-20 rounded-xl p-3">
            <div className="flex justify-between text-white text-sm mb-2">
              <span>Орындалған</span>
              <span className="font-bold">
                {completedCount}/{categories.length}
              </span>
            </div>
            <div className="w-full bg-indigo-600 bg-opacity-30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${categories.length ? (completedCount / categories.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

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
            const count = progress[category.id] || 0;
            const isDone = count >= category.target;
            const pct = Math.min((count / category.target) * 100, 100);

            return (
              <div
                key={category.id}
                className={`rounded-xl p-3 shadow-sm transition-all ${
                  isDone ? "bg-white border border-green-500" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => navigate(`/counter/${category.id}`)}
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
                  onClick={() => navigate(`/counter/${category.id}`)}
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
