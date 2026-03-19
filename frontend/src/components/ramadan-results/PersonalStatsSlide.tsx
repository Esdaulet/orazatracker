import { motion } from "framer-motion";
import type { RamadanResults } from "../../services/ramadanResultsService";

interface Props {
  data: RamadanResults;
}

export default function PersonalStatsSlide({ data }: Props) {
  const total = data.categories.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="flex flex-col h-full px-6 pt-14 pb-8"
      style={{ background: "linear-gradient(160deg, #0a0a0a, #0d1117, #111827)" }}>

      <motion.div className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>
        <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-2">Сіздің нәтижеңіз</p>
        <h2 className="text-2xl font-bold text-white">Амалдар</h2>
        <p className="text-white/30 text-sm mt-1 font-light">
          Жалпы: <span className="text-white/60">{total.toLocaleString()} рет</span>
        </p>
      </motion.div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {data.categories.map((cat, i) => {
          const pct = Math.min(100, Math.round((cat.total / (cat.target * 29)) * 100));
          return (
            <motion.div key={cat.id}
              className="bg-white/5 border border-white/8 rounded-xl px-4 py-3"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-4">
                  <p className="text-white text-sm font-medium">{cat.name}</p>
                  {cat.meaning && (
                    <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{cat.meaning}</p>
                  )}
                </div>
                <span className="text-white font-bold text-lg">{cat.total.toLocaleString()}</span>
              </div>
              <div className="w-full h-0.5 bg-white/10 rounded-full">
                <motion.div className="h-full bg-white/40 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
