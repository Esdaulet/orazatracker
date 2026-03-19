import { motion } from "framer-motion";

export default function IntroSlide() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: "linear-gradient(160deg, #0f0c29, #302b63, #24243e)" }}
    >
      <motion.div className="text-7xl mb-8"
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}>🌙</motion.div>

      <motion.p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-4"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}>2026</motion.p>

      <motion.h1 className="text-3xl font-bold text-white leading-tight mb-4"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}>
        Бұл ай —<br />нұрға толы болды
      </motion.h1>

      <motion.p className="text-white/50 text-base font-light mt-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}>
        Әрбір күні —<br />Раббыңа бір қадам
      </motion.p>
    </div>
  );
}
