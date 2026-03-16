import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCategories } from "../services/categoryService";
import { getProgress, saveProgress } from "../services/progressService";
import { ArrowLeft, CheckCircle2, Square } from "lucide-react";
import BottomNav from "../components/BottomNav";
import KadirNightModal from "../components/KadirNightModal";
import type { Category } from "../types";

const BG_STYLE = {
  backgroundImage: "url('/kadir.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

// Қадір түнесінің дұғасы
const KADIR_DUA = {
  arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
  translit: "Аллаһумма иннәкә 'афуун, тухиббул 'афуа фа'фу 'анни",
  kazakh:
    "Иә, Алла! Сен Кешірімдісің, кешіруді жақсы көресің, мені кешіре көр!",
};

export default function KadirNight() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<Record<string, number | number[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(() => {
    const hasSeenModal = localStorage.getItem("kadir_modal_seen");
    return !hasSeenModal;
  });

  const today = new Date().toISOString().split("T")[0];

  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem("kadir_modal_seen", "true");
  };

  // Load categories and progress
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [catData, progData] = await Promise.all([
          getCategories(),
          getProgress(today),
        ]);
        setCategories(catData.sort((a, b) => a.order - b.order));
        setProgress(progData || {});
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, today, navigate]);

  const glassDark = {
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  const glassGold = {
    background: "rgba(251,191,36,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(251,191,36,0.25)",
  };

  return (
    <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
      <div className="absolute inset-0 bg-black/70" />
      <KadirNightModal isOpen={showModal} onClose={handleCloseModal} />
      <div className="relative z-10 px-4">
        {/* Header */}
        <div className="pt-8 pb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Қадір Түні
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Мың айдан артық сауап болатын түн
          </p>
        </div>

        {/* Қадір Дұғасы */}
        <div className="rounded-2xl p-4 mb-6" style={glassGold}>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-2">
            ✨ Негізгі Дұға
          </p>
          <p className="text-white font-semibold mb-1">{KADIR_DUA.translit}</p>
          <p className="text-white/70 text-sm mb-3">{KADIR_DUA.kazakh}</p>
          <p className="text-white/50 text-xs italic">
            Айша анамыз (р.а.) Пайғамбарымыздан (с.ғ.с.) сұрағанда, ол кісі бұл дұғаны үйреткен.
            Түн бойы қайталап айту ең абзалы.
          </p>
        </div>

        {/* Қауымдастық Амалдары — Бүгінгі Категориялар */}
        {!loading && categories.length > 0 && (
          <div className="relative z-10">
            <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">
              📋 Бүгінгі Амалдар
            </h2>
            <div className="flex flex-col gap-2">
              {categories.map((category) => {
                const rawCount =
                  progress[category.id] !== undefined
                    ? progress[category.id]
                    : 0;
                const count = Array.isArray(rawCount)
                  ? rawCount.filter((x) => x >= 33).length
                  : Number(rawCount);
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
                            category.target === 3 &&
                            category.name.includes("есімі")
                              ? `/names/${category.id}`
                              : `/counter/${category.id}`;
                          navigate(path);
                        }}
                        className="flex-1 text-left"
                      >
                        <h3 className="font-bold text-white">
                          {category.name}
                        </h3>
                      </button>
                      <button
                        onClick={() => {
                          const path =
                            category.target === 3 &&
                            category.name.includes("есімі")
                              ? `/names/${category.id}`
                              : `/counter/${category.id}`;
                          navigate(path);
                        }}
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
                          category.target === 3 &&
                          category.name.includes("есімі")
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
                          <span className="text-white/50">
                            {Math.round(pct)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${isDone ? "bg-green-400" : "bg-white/40"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
