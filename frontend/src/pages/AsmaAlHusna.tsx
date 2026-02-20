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

export default function AsmaAlHusna() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [names, setNames] = useState<AsmaName[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const START_DATE = new Date("2026-02-19");

  // Calculate current day of challenge
  useEffect(() => {
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
    );
    const currentDay = Math.min(Math.max(diffDays + 1, 1), 33);
    setSelectedDay(currentDay);
  }, []);

  // Fetch asma names on mount
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

  // Get 3 names for selected day
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

  // Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 pb-24">
        <div className="bg-gradient-to-r from-amber-700 to-orange-900 px-4 pt-12 pb-8 text-white">
          <div className="h-8 w-40 bg-white/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="px-4 mt-8">
          <div className="h-12 bg-gray-300 rounded animate-pulse mb-6" />
          <div className="h-40 bg-gray-300 rounded animate-pulse mb-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-900 px-4  pb-8 text-white  top-0 z-10">
        <div className="flex items-center gap-2 mb-4 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex gap-2  hover:opacity-80 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Алланың 99 көркем есімі
          </h1>
        </div>
        <p className="text-amber-100 mt-2">
          {selectedDay}-күн / 33 | Есімдер {(selectedDay - 1) * 3 + 1}–
          {Math.min(selectedDay * 3, 99)}
        </p>
      </div>

      {/* Day Selector */}
      <div className="px-4 mt-6 flex gap-2 overflow-x-auto pb-4 scroll-smooth">
        {Array.from({ length: 33 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            onClick={() => handleDaySelect(day)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
              selectedDay === day
                ? "bg-orange-600 text-white scale-110"
                : "bg-white text-amber-900 border-2 border-amber-300"
            } active:scale-95`}
          >
            {day}-күн
          </button>
        ))}
      </div>

      {/* Flashcard */}
      {currentName ? (
        <div className="px-4 mt-8 flex flex-col items-center">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-sm h-64 cursor-pointer"
            style={{
              perspective: "1000px",
            }}
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
                className="absolute w-full h-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center border-4 border-amber-300"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <p className="text-sm text-amber-600 font-semibold mb-4">
                  {currentName.number}-есім / 99
                </p>
                <p
                  className="text-5xl font-bold text-amber-900 text-center mb-4"
                  style={{ fontFamily: "serif" }}
                >
                  {currentName.name}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  (мағынасын көру үшін басыңыз)
                </p>
              </div>

              {/* Back */}
              <div
                className="absolute w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-white border-4 border-orange-300"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <p
                  className="text-4xl font-bold text-center mb-4"
                  style={{ fontFamily: "serif" }}
                >
                  {currentName.name}
                </p>
                <p className="text-xl font-semibold mb-2 text-center">
                  {ASMA_KAZAKH_TRANSLIT[currentName.number]}
                </p>
                <p className="text-lg text-center text-orange-100">
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
              className={`p-3 rounded-full transition-all ${
                cardIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 active:scale-95"
              }`}
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-lg font-bold text-amber-900">
              {cardIndex + 1}/3
            </span>
            <button
              onClick={handleNextCard}
              disabled={cardIndex === 2}
              className={`p-3 rounded-full transition-all ${
                cardIndex === 2
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 active:scale-95"
              }`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="mt-8 bg-white rounded-2xl p-6 w-full max-w-sm border-l-4 border-orange-600 shadow-lg">
            <h3 className="font-bold text-amber-900 mb-2">{selectedDay}-күн</h3>

            <p className="text-gray-700 text-sm">
              Бүгін жүрегіңізге тоқитын көркем есімдер:
            </p>

            <ul className="mt-3 space-y-1">
              {namesForDay.map((name) => (
                <li key={name.number} className="text-sm text-gray-600">
                  {name.number}. {ASMA_KAZAKH_TRANSLIT[name.number]} —{" "}
                  {ASMA_KAZAKH[name.number]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="px-4 mt-8 bg-white rounded-2xl p-6 text-center text-gray-600">
          Есімдер жүктелмеді
        </div>
      )}

      <BottomNav />
    </div>
  );
}
