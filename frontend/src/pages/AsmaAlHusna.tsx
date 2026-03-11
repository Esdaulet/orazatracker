import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { ASMA_KAZAKH } from "../data/asmaKazakh";
import { ASMA_KAZAKH_TRANSLIT } from "../data/asmaKazakhTranslit";

interface AsmaName {
  name: string;
  transliteration: string;
  number: number;
  en: {
    meaning: string;
  };
}

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
  background: "rgba(0,0,0,0.3)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.12)",
};

export default function AsmaAlHusna() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [names, setNames] = useState<AsmaName[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const START_DATE = new Date("2026-02-19");
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
    );
    const currentDay = Math.min(Math.max(diffDays + 1, 1), 33);
    setSelectedDay(currentDay);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchAsma = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api.aladhan.com/v1/asmaAlHusna");
        if (!response.ok) throw new Error("Failed to fetch asma names");
        const data = await response.json();
        setNames(data.data || []);
      } catch (error) {
        console.error("Error fetching asma names:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAsma();
  }, [user, navigate]);

  const namesForDay = names.slice(
    (selectedDay - 1) * 3,
    (selectedDay - 1) * 3 + 3,
  );
  const currentName = namesForDay[cardIndex];

  const handleNextCard = () => {
    if (cardIndex < 2) {
      setCardIndex(cardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setCardIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4 pt-12 pb-6">
          <div className="h-8 w-40 bg-white/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-white/15 rounded animate-pulse" />
        </div>
        <div className="relative z-10 px-4">
          <div className="flex gap-2 overflow-hidden mb-6">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-9 w-16 bg-white/15 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
          <div className="h-64 w-full rounded-3xl bg-white/10 animate-pulse mb-6" />
          <div className="h-32 w-full rounded-2xl bg-white/10 animate-pulse" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
      <div className="absolute inset-0 bg-black/50" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/70 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-white">Алланың 99 көркем есімі</h1>
        <p className="text-white/50 text-sm mt-1">
          {selectedDay}-күн / 33 | Есімдер {(selectedDay - 1) * 3 + 1}–{Math.min(selectedDay * 3, 99)}
        </p>
      </div>

      {/* Day Selector */}
      <div className="relative z-10 px-4 flex gap-2 overflow-x-auto pb-4 scroll-smooth">
        {Array.from({ length: 33 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            onClick={() => handleDaySelect(day)}
            className="px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all active:scale-95"
            style={
              selectedDay === day
                ? { background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)", color: "white" }
                : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }
            }
          >
            {day}-күн
          </button>
        ))}
      </div>

      {/* Flashcard */}
      {currentName ? (
        <div className="relative z-10 px-4 mt-6 flex flex-col items-center">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-sm h-64 cursor-pointer"
            style={{ perspective: "1000px" }}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="absolute w-full h-full rounded-3xl p-8 flex flex-col items-center justify-center"
                style={{
                  ...glass,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <p className="text-sm text-white/60 font-semibold mb-4">
                  {currentName.number}-есім / 99
                </p>
                <p
                  className="text-5xl font-bold text-white text-center mb-4"
                  style={{ fontFamily: "serif" }}
                >
                  {currentName.name}
                </p>
                <p className="text-sm text-white/40 mt-4">
                  (мағынасын көру үшін басыңыз)
                </p>
              </div>

              {/* Back */}
              <div
                className="absolute w-full h-full rounded-3xl p-8 flex flex-col items-center justify-center"
                style={{
                  background: "rgba(99,60,200,0.45)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <p
                  className="text-4xl font-bold text-white text-center mb-4"
                  style={{ fontFamily: "serif" }}
                >
                  {currentName.name}
                </p>
                <p className="text-xl font-semibold mb-2 text-center text-white">
                  {ASMA_KAZAKH_TRANSLIT[currentName.number]}
                </p>
                <p className="text-lg text-center text-white/70">
                  {ASMA_KAZAKH[currentName.number]}
                </p>
              </div>
            </div>
          </div>

          {/* Card Navigation */}
          <div className="mt-8 flex items-center gap-6">
            <button
              onClick={handlePrevCard}
              disabled={cardIndex === 0}
              className="p-3 rounded-full transition-all active:scale-95 disabled:opacity-30"
              style={glassDark}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <span className="text-lg font-bold text-white">{cardIndex + 1}/3</span>
            <button
              onClick={handleNextCard}
              disabled={cardIndex === 2}
              className="p-3 rounded-full transition-all active:scale-95 disabled:opacity-30"
              style={glassDark}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          {/* Day summary */}
          <div className="mt-6 w-full max-w-sm rounded-2xl p-5" style={{ ...glassDark, borderLeft: "3px solid rgba(139,92,246,0.6)" }}>
            <h3 className="font-bold text-white mb-2">{selectedDay}-күн</h3>
            <p className="text-white/60 text-sm">Бүгін жүрегіңізге тоқитын көркем есімдер:</p>
            <ul className="mt-3 space-y-1">
              {namesForDay.map((name) => (
                <li key={name.number} className="text-sm text-white/70">
                  {name.number}. {ASMA_KAZAKH_TRANSLIT[name.number]} —{" "}
                  <span className="text-white/90">{ASMA_KAZAKH[name.number]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="relative z-10 px-4 mt-8">
          <div className="rounded-2xl p-6 text-center" style={glassDark}>
            <p className="text-white/60">Есімдер жүктелмеді</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
