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

const BG_STYLE: React.CSSProperties = {
  backgroundImage: "url('/2.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "16px",
};

const getStorageKey = (categoryId: string, date: string) =>
  `names_${categoryId}_${date}`;

const getAsmaNumbersForToday = (): number[] => {
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
  );
  const currentDay = Math.min(Math.max(diffDays + 1, 1), 33);
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

  useEffect(() => {
    if (!user || !categoryId) {
      navigate("/dashboard");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const todayAsmaNumbers = getAsmaNumbersForToday();
        setProgress(todayAsmaNumbers.map((num) => ({ number: num, count: 0 })));

        const response = await fetch("https://api.aladhan.com/v1/asmaAlHusna");
        if (!response.ok) throw new Error("Failed to fetch asma names");
        const data = await response.json();

        const todayNames = data.data.filter((name: AsmaName) =>
          todayAsmaNumbers.includes(name.number),
        );
        setNames(todayNames);

        const storageKey = getStorageKey(categoryId as string, today);
        let storedCounts = localStorage.getItem(storageKey);

        let parsedProgress: NameProgress[] = todayAsmaNumbers.map((num) => ({
          number: num,
          count: 0,
        }));

        if (storedCounts) {
          try {
            const counts = JSON.parse(storedCounts);
            parsedProgress = todayAsmaNumbers.map((num, idx) => ({
              number: num,
              count: counts[idx] || 0,
            }));
          } catch {
            storedCounts = null;
          }
        }

        if (!storedCounts) {
          try {
            const progressData = await getProgress(today);
            const categoryData = progressData[categoryId as string];

            if (Array.isArray(categoryData)) {
              parsedProgress = todayAsmaNumbers.map((num, idx) => ({
                number: num,
                count: categoryData[idx] || 0,
              }));
            } else {
              parsedProgress = todayAsmaNumbers.map((num) => ({
                number: num,
                count: 0,
              }));
            }
          } catch {
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
            const counts = newProgress.map((p) => p.count);
            const totalCount = counts.reduce((sum, c) => sum + c, 0);

            const storageKey = getStorageKey(categoryId, today);
            localStorage.setItem(storageKey, JSON.stringify(counts));

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
      <div className="min-h-screen flex flex-col pb-24" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4 pt-4 pb-8">
          <div
            className="mb-4 w-8 h-8 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
          <div
            className="h-7 w-48 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
        </div>
        <div className="relative z-10 px-4 mt-2 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 animate-pulse" style={glassCard}>
              <div
                className="h-6 w-32 rounded mb-3"
                style={{ background: "rgba(255,255,255,0.15)" }}
              />
              <div
                className="h-4 w-24 rounded mb-2"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
              <div
                className="h-3 w-full rounded"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24 relative" style={BG_STYLE}>
      <div className="absolute inset-0 bg-black/50" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-3 pb-4 text-white">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-3 p-1.5 rounded-full transition"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">Бүгінгі жаттайтын есімдер</h1>
        <p className="text-white/60 text-xs mt-0.5">
          Әр есімді 33 рет қайталаңыз
        </p>
      </div>

      {/* Names Cards */}
      <div className="relative z-10 px-4 flex flex-col gap-2">
        {names.map((name, idx) => {
          const nameProgress = progress[idx];
          const isComplete = nameProgress.count >= REPEATS_NEEDED;
          const kazakhTranslit = ASMA_KAZAKH_TRANSLIT[name.number];
          const kazakhMeaning = ASMA_KAZAKH[name.number];

          return (
            <div
              key={name.number}
              style={{
                ...glassCard,
                ...(isComplete
                  ? {
                      border: "1px solid rgba(74,222,128,0.5)",
                      background: "rgba(74,222,128,0.1)",
                    }
                  : {}),
              }}
              className="p-3 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-base text-white">
                      {kazakhTranslit}
                    </h3>
                    {isComplete && (
                      <CheckCircle size={16} className="text-green-400" />
                    )}
                  </div>
                  <p className="text-xs text-white/60">{kazakhMeaning}</p>
                </div>
              </div>

              <button
                onClick={() => handleIncrement(name.number)}
                disabled={isComplete}
                className="w-full py-2 rounded-xl font-semibold transition-all active:scale-95 text-sm"
                style={
                  isComplete
                    ? { background: "rgba(74,222,128,0.2)", color: "#4ade80" }
                    : {
                        background: "rgba(255,255,255,0.15)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{nameProgress.count}</span>
                  <span className="text-white/40">/</span>
                  <span>{REPEATS_NEEDED}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {isAllDone && (
        <div className="relative z-10 px-4 mt-4">
          <div
            className="p-4 flex items-center gap-3"
            style={{
              background: "rgba(74,222,128,0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: "16px",
            }}
          >
            <CheckCircle size={24} className="text-green-400" />
            <div>
              <p className="font-bold text-white">Өте сәтті!</p>
              <p className="text-sm text-white/70">
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
