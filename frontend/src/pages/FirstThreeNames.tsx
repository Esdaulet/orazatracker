import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getProgress, saveProgress } from "../services/progressService";
import { ASMA_KAZAKH } from "../data/asmaKazakh";
import { ASMA_KAZAKH_TRANSLIT } from "../data/asmaKazakhTranslit";
import { ArrowLeft, CheckCircle } from "lucide-react";
import BottomNav from "../components/BottomNav";

interface AsmaName {
  name: string;
  transliteration: string;
  number: number;
  en: {
    meaning: string;
  };
}

interface NameProgress {
  number: number;
  count: number;
}

const REPEATS_NEEDED = 33;
const START_DATE = new Date("2026-02-19");

// Helper to get localStorage key for individual counts
const getStorageKey = (categoryId: string, date: string) =>
  `names_${categoryId}_${date}`;

// Calculate which 3 names to show based on current day
const getAsmaNumbersForToday = (): number[] => {
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
  );
  const currentDay = Math.min(Math.max(diffDays + 1, 1), 33);

  // Each day has 3 names: day 1 = [1,2,3], day 2 = [4,5,6], etc.
  const startNumber = (currentDay - 1) * 3 + 1;
  return [startNumber, startNumber + 1, startNumber + 2];
};

export default function FirstThreeNames() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [names, setNames] = useState<AsmaName[]>([]);
  const [progress, setProgress] = useState<NameProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch asma names and load progress
  useEffect(() => {
    if (!user || !categoryId) {
      navigate("/dashboard");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // Calculate which names to show for today
        const todayAsmaNumbers = getAsmaNumbersForToday();

        // Initialize progress for today's names
        setProgress(todayAsmaNumbers.map((num) => ({ number: num, count: 0 })));

        // Fetch names from API
        const response = await fetch("https://api.aladhan.com/v1/asmaAlHusna");
        if (!response.ok) throw new Error("Failed to fetch asma names");
        const data = await response.json();

        // Filter to get only today's 3 names
        const todayNames = data.data.filter((name: AsmaName) =>
          todayAsmaNumbers.includes(name.number),
        );
        setNames(todayNames);

        // Load progress from localStorage first (for individual counts)
        const storageKey = getStorageKey(categoryId as string, today);
        let storedCounts = localStorage.getItem(storageKey);

        let parsedProgress: NameProgress[] = todayAsmaNumbers.map((num) => ({
          number: num,
          count: 0,
        }));

        if (storedCounts) {
          // Load individual counts from localStorage
          try {
            const counts = JSON.parse(storedCounts);
            parsedProgress = todayAsmaNumbers.map((num, idx) => ({
              number: num,
              count: counts[idx] || 0,
            }));
          } catch {
            // If parse fails, load from backend
            storedCounts = null;
          }
        }

        // If no localStorage data, try to restore from backend
        if (!storedCounts) {
          try {
            const progressData = await getProgress(today);
            const categoryData = progressData[categoryId as string];

            // Check if it's an array (individual counts) or number (total count)
            if (Array.isArray(categoryData)) {
              parsedProgress = todayAsmaNumbers.map((num, idx) => ({
                number: num,
                count: categoryData[idx] || 0,
              }));
            } else {
              // Initialize with 0 for each name
              parsedProgress = todayAsmaNumbers.map((num) => ({
                number: num,
                count: 0,
              }));
            }
          } catch {
            // Initialize with 0 for each name
            parsedProgress = todayAsmaNumbers.map((num) => ({
              number: num,
              count: 0,
            }));
          }
        }

        setProgress(parsedProgress);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, categoryId, navigate]);

  const debouncedSave = useCallback(
    (newProgress: NameProgress[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (categoryId) {
            // Get individual counts
            const counts = newProgress.map((p) => p.count);
            const totalCount = counts.reduce((sum, c) => sum + c, 0);

            // Save individual counts to localStorage
            const storageKey = getStorageKey(categoryId, today);
            localStorage.setItem(storageKey, JSON.stringify(counts));

            // Save to backend
            // If all 99 complete, save as 3 for dashboard compatibility
            // Otherwise save the array of individual counts
            if (totalCount >= 99) {
              await saveProgress(today, categoryId, 3);
            } else {
              await saveProgress(today, categoryId, counts);
            }
          }
        } catch (error) {
          console.error("Error saving progress:", error);
        }
      }, 1000);
    },
    [categoryId, today],
  );

  const handleIncrement = useCallback(
    (nameNumber: number) => {
      const newProgress = progress.map((p) =>
        p.number === nameNumber && p.count < REPEATS_NEEDED
          ? { ...p, count: p.count + 1 }
          : p,
      );
      setProgress(newProgress);
      debouncedSave(newProgress);
    },
    [progress, debouncedSave],
  );

  const isAllDone = progress.every((p) => p.count >= REPEATS_NEEDED);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col pb-24">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-4 pb-8">
          <div className="mb-4 w-8 h-8 bg-indigo-600 rounded animate-pulse" />
          <div className="h-7 w-48 bg-indigo-600 rounded animate-pulse" />
        </div>

        {/* Cards Skeleton */}
        <div className="px-4 mt-6 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
            >
              <div className="h-6 w-32 bg-gray-300 rounded mb-3" />
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-4 pb-8 text-white">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 p-1 hover:bg-indigo-600 rounded transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Бүгінгі жаттайтын есімдер</h1>
        <p className="text-indigo-200 text-sm mt-1">
          Әр есімді 33 рет қайталаңыз
        </p>
      </div>

      {/* Progress Summary */}

      {/* Names Cards */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {names.map((name, idx) => {
          const nameProgress = progress[idx];
          const isComplete = nameProgress.count >= REPEATS_NEEDED;
          const kazakhTranslit = ASMA_KAZAKH_TRANSLIT[name.number];
          const kazakhMeaning = ASMA_KAZAKH[name.number];

          return (
            <div
              key={name.number}
              className={`rounded-2xl p-4 shadow-sm transition-all ${
                isComplete ? "bg-white border-2 border-green-500" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {kazakhTranslit}
                    </h3>
                    {isComplete && (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{kazakhMeaning}</p>
                </div>
              </div>

              {/* Counter */}
              <button
                onClick={() => handleIncrement(name.number)}
                disabled={isComplete}
                className={`w-full py-3 rounded-lg font-semibold transition-all active:scale-95 ${
                  isComplete
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{nameProgress.count}</span>
                  <span className="text-gray-400">/</span>
                  <span>{REPEATS_NEEDED}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {isAllDone && (
        <div className="px-4 mt-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-bold text-green-800">Өте сәтті!</p>
              <p className="text-sm text-green-700">
                Бүгінгі үшеуін толық үйренівіз! 🎉
              </p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
