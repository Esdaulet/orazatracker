import { motion } from "framer-motion";

export default function NominationsIntroSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: "linear-gradient(160deg, #1a0533, #2d1b69, #0f0c29)" }}>

      <motion.div className="text-6xl mb-8"
        initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}>🏆</motion.div>

      <motion.p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        Рамазан 2026
      </motion.p>

      <motion.h1 className="text-3xl font-bold text-white leading-tight mb-4"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}>
        Рамазан үздіктері
      </motion.h1>

      <motion.p className="text-white/50 text-base font-light"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        Бұл айда ерекшеленген<br />жандармен бірге танысайық
      </motion.p>
    </div>
  );
}
