import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCategories } from "../services/categoryService";
import { getProgress, saveProgress } from "../services/progressService";
import { ArrowLeft, CheckCircle } from "lucide-react";
import type { Category } from "../types";

function RollingDigit({
  digit,
  animateKey,
  isDone,
}: {
  digit: string;
  animateKey: string;
  isDone: boolean;
}) {
  return (
    <div
      style={{ overflow: "hidden", height: "1.1em", display: "inline-block" }}
    >
      <span
        key={animateKey}
        style={{
          display: "block",
          animation: "rollDown 0.25s cubic-bezier(0.23, 1, 0.32, 1)",
          color: isDone ? "#4ade80" : "white",
        }}
      >
        {digit}
      </span>
    </div>
  );
}

const BG_STYLE = {
  backgroundImage: "url('/2.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

export default function CategoryCounter() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [category, setCategory] = useState<Category | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!user || !categoryId) {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [user, categoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const categories = await getCategories();
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) {
        navigate("/dashboard");
        return;
      }
      setCategory(cat);

      const progress = await getProgress(today);
      const rawCount = progress[categoryId as string] || 0;
      const count = Array.isArray(rawCount) ? 0 : rawCount;
      setCount(count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSave = useCallback(
    (newCount: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (categoryId) {
            await saveProgress(today, categoryId, newCount);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    },
    [categoryId, today],
  );

  const handleIncrement = useCallback(() => {
    prevCountRef.current = count;
    const newCount = count + 1;
    setCount(newCount);
    debouncedSave(newCount);
  }, [count, debouncedSave]);

  const isDone = category && count >= category.target;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4 pt-12 pb-6">
          <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse mb-6" />
          <div className="h-7 w-40 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-8">
          <div className="w-48 h-48 rounded-3xl bg-white/10 backdrop-blur-sm animate-pulse" />
          <div className="w-full max-w-sm h-3 bg-white/20 rounded-full animate-pulse" />
          <div className="w-full max-w-sm h-20 bg-white/10 backdrop-blur-sm rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Категория табылмады</p>
      </div>
    );
  }

  const progress = Math.min((count / category.target) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col relative" style={BG_STYLE}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-bold text-white">{category.name}</h1>
          <span className="text-white/70 text-lg font-medium">
            / {category.target}
          </span>
        </div>
      </div>

      {/* Counter Section */}
      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8"
        onClick={handleIncrement}
      >
        {/* Big Counter — glass card */}
        <div
          onClick={handleIncrement}
          className="w-48 h-48 rounded-3xl flex items-center justify-center cursor-pointer  transition-all shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <div className="text-center">
            <style>{`@keyframes rollDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
            <p className="text-white/60 text-sm mb-2 tracking-widest uppercase">
              Есеп
            </p>
            <div className="text-6xl font-bold flex justify-center">
              {(() => {
                const currStr = String(count);
                const prevStr = String(prevCountRef.current).padStart(
                  currStr.length,
                  "0",
                );
                return currStr
                  .split("")
                  .map((d, i) => (
                    <RollingDigit
                      key={i}
                      digit={d}
                      animateKey={
                        prevStr[i] !== currStr[i] ? `${count}-${i}` : `s-${i}`
                      }
                      isDone={!!isDone}
                    />
                  ));
              })()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm mb-2 text-white/80">
            <span>
              {count} / {category.target}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${isDone ? "bg-green-400" : "bg-white"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Completion Status */}
        {isDone && (
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-full"
            style={{
              background: "rgba(34,197,94,0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(34,197,94,0.4)",
            }}
          >
            <CheckCircle size={20} className="text-green-400" />
            <p className="text-green-300 font-semibold">Тапсырма орындалды!</p>
          </div>
        )}

        {/* Meaning — glass card */}
        {category.meaning && (
          <div
            className="w-full max-w-xs rounded-2xl px-6 py-5"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <p className="text-white/90 text-sm leading-relaxed text-center">
              {category.meaning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
