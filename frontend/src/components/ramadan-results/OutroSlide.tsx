import { motion } from "framer-motion";

export default function OutroSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: "linear-gradient(160deg, #0f0c29, #1a0533, #0a0a0a)" }}>

      <motion.div className="text-6xl mb-8"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}>🌙</motion.div>

      <motion.p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        Рамазан 2026
      </motion.p>

      <motion.h1 className="text-2xl font-bold text-white leading-snug mb-6"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}>
        Нағыз Рамазан<br />енді басталды
      </motion.h1>

      <motion.p className="text-white/50 text-sm font-light leading-relaxed max-w-xs mb-12"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }}>
        Бұл айда қалыптасқан<br />жақсы әдеттер —<br />сенімен бірге жалғассын
      </motion.p>

      <motion.p className="text-white/25 text-xs tracking-widest uppercase"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        Келесі Рамазанда кездескенше
      </motion.p>
    </div>
  );
}
