import { useEffect, useState } from "react";
import { getAllLeaderboards } from "../../services/leaderboardService";
import type { LeaderboardEntry } from "../../services/leaderboardService";

export default function LeaderboardSlide() {
  const [top, setTop] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLeaderboards()
      .then((data) => {
        setTop((data?.marathon?.topList || []).slice(0, 7));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-8"
      style={{ background: "linear-gradient(160deg, #0a0a0a, #111827, #0f172a)" }}>
      <div className="text-center mb-8">
        <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-2">Рамазан 2026</p>
        <h2 className="text-2xl font-bold text-white">Жалпы Рейтинг</h2>
        <p className="text-white/40 text-sm mt-1 font-light">Марафон — аяқталған күндер</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          {top.map((entry) => (
            <div key={`${entry.rank}-${entry.userId}`}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-xl w-8 text-center">
                {entry.medal || entry.rank}
              </span>
              <span className="flex-1 text-white text-sm font-medium truncate">
                {entry.displayName}
              </span>
              <span className="text-white/60 text-sm">{entry.score} күн</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-white/20 text-xs mt-6">
        Рамазан Кәрім 🌙
      </p>
    </div>
  );
}