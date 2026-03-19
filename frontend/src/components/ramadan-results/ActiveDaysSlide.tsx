import { motion } from "framer-motion";
import type { RamadanResults } from "../../services/ramadanResultsService";

interface Props {
  data: RamadanResults;
}

export default function ActiveDaysSlide({ data }: Props) {
  const percent = Math.round((data.activeDays / data.totalRamadanDays) * 100);

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: "linear-gradient(160deg, #0a0a0a, #1a1a2e, #16213e)" }}
    >
      <motion.p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-12"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        Сенің Рамазаның
      </motion.p>

      <motion.span className="text-8xl font-bold text-white mb-2 block"
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}>
        {data.activeDays}
      </motion.span>

      <motion.p className="text-white/70 text-xl mb-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}>
        күн сен белсенді болдың
      </motion.p>

      <motion.p className="text-white/40 text-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
        Рамазанның {percent}%
      </motion.p>

      <motion.p className="text-white/50 text-sm mt-6 max-w-xs leading-relaxed"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
        Әрбір күн —<br />Раббыңа жақындау
      </motion.p>

      <motion.div className="w-full max-w-xs mt-12 space-y-4"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.4 }}>
        <StatRow label="Квиз тапсырдың" value={`${data.quiz.totalQuizzes} рет`} />
        <StatRow label="Жинаған ұпайың" value={`${data.quiz.totalScore}`} />
      </motion.div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/10 pb-3">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );
}
