import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getRamadanResults } from "../services/ramadanResultsService";
import type { RamadanResults as RamadanResultsType } from "../services/ramadanResultsService";
import IntroSlide from "../components/ramadan-results/IntroSlide";
import ActiveDaysSlide from "../components/ramadan-results/ActiveDaysSlide";
import NominationSlide from "../components/ramadan-results/NominationSlide";
import PersonalStatsSlide from "../components/ramadan-results/PersonalStatsSlide";
import NominationsIntroSlide from "../components/ramadan-results/NominationsIntroSlide";
import OutroSlide from "../components/ramadan-results/OutroSlide";
import LeaderboardSlide from "../components/ramadan-results/LeaderboardSlide";

interface Props {
  onDone?: () => void;
}

export default function RamadanResults({ onDone }: Props) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [data, setData] = useState<RamadanResultsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getRamadanResults()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const slides = data ? [
    "intro",
    "active",
    "personal",
    "nominations-intro",
    ...data.nominations.map((_, i) => `nomination-${i}`),
    "leaderboard",
    "outro",
  ] : ["intro"];

  const totalSlides = slides.length;

  const handleDone = () => {
    if (onDone) { onDone(); return; }
    localStorage.setItem("ramadan2026_results_seen", "1");
    navigate("/dashboard");
  };

  const goNext = () => {
    if (currentSlide === totalSlides - 1) { handleDone(); return; }
    setCurrentSlide((p) => p + 1);
  };
  const goPrev = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  const renderSlide = () => {
    if (loading || !data) {
      return (
        <div className="flex items-center justify-center h-full"
          style={{ background: "linear-gradient(160deg, #0f0c29, #302b63)" }}>
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      );
    }

    const slide = slides[currentSlide];
    if (slide === "intro") return <IntroSlide />;
    if (slide === "active") return <ActiveDaysSlide data={data} />;
    if (slide === "personal") return <PersonalStatsSlide data={data} />;
    if (slide === "nominations-intro") return <NominationsIntroSlide />;
    if (slide === "leaderboard") return <LeaderboardSlide />;
    if (slide === "outro") return <OutroSlide />;
    if (slide.startsWith("nomination-")) {
      const idx = parseInt(slide.split("-")[1]);
      return <NominationSlide nomination={data.nominations[idx]} index={idx} />;
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-3 pt-3">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/20">
            <div
              className="h-full bg-white/70 transition-all duration-300"
              style={{ width: i < currentSlide ? "100%" : i === currentSlide ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={handleDone}
        className="absolute top-6 right-4 z-10 text-white/60 hover:text-white text-sm"
      >
        ✕
      </button>

      {/* Slide content */}
      <div key={slides[currentSlide]} className="h-full w-full">
        {renderSlide()}
      </div>

      {/* Tap zones */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="w-1/3 h-full pointer-events-auto" onClick={goPrev} />
        <div className="w-2/3 h-full pointer-events-auto" onClick={goNext} />
      </div>
    </div>
  );
}