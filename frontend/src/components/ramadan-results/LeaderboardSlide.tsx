import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

      <motion.div className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>
        <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-2">Рамазан 2026</p>
        <h2 className="text-2xl font-bold text-white">Камил күн үздіктері</h2>
        <p className="text-white/40 text-sm mt-1 font-light">
          Барлық амалды толық орындаған<br />ең үздік қатысушылар
        </p>
      </motion.div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          {top.map((entry, i) => (
            <motion.div key={`${entry.rank}-${entry.userId}`}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}>
              <span className="text-xl w-8 text-white text-center">{entry.medal || entry.rank}</span>
              <span className="flex-1 text-white text-sm font-medium truncate">{entry.displayName}</span>
              <span className="text-white/60 text-sm">{entry.score} камил күн</span>
            </motion.div>
          ))}
        </div>
      )}

      <motion.p className="text-center text-white/20 text-xs mt-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        Рамазан Кәрім 🌙
      </motion.p>
    </div>
  );
}
