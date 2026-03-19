import { motion } from "framer-motion";
import type { Nomination } from "../../services/ramadanResultsService";

const GRADIENTS = [
  "linear-gradient(160deg, #1a0533, #3b0764, #1e1b4b)",
  "linear-gradient(160deg, #0c1a0c, #14532d, #052e16)",
  "linear-gradient(160deg, #1c0a00, #431407, #1c1917)",
  "linear-gradient(160deg, #0c0a1e, #1e1b4b, #312e81)",
  "linear-gradient(160deg, #0a1628, #1e3a5f, #0f172a)",
  "linear-gradient(160deg, #1a0a2e, #2d1b69, #0f0c29)",
];

const MEDALS = ["🥇", "🥇", "🥇", "🏅", "⭐", "✨"];

import type { Transition, TargetAndTransition } from "framer-motion";

type AnimDef = { initial: TargetAndTransition; animate: TargetAndTransition; transition: Transition };

const MEDAL_ANIMATIONS: AnimDef[] = [
  { initial: { scale: 0, rotate: -180 }, animate: { scale: 1, rotate: 0 }, transition: { duration: 0.7, ease: "easeOut" as const } },
  { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.6, ease: "easeOut" as const } },
  { initial: { y: -100, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, type: "spring", bounce: 0.5 } },
  { initial: { scale: 3, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.6, ease: "easeOut" as const } },
  { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.6, ease: "easeOut" as const } },
  { initial: { rotate: 180, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, transition: { duration: 0.7, ease: "easeOut" as const } },
];

const CARD_ANIMATIONS: AnimDef[] = [
  { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6, duration: 0.5 } },
  { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.6, duration: 0.5 } },
  { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.6, duration: 0.5 } },
  { initial: { opacity: 0, y: -60 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6, duration: 0.5 } },
  { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.6, duration: 0.5 } },
  { initial: { opacity: 0, scale: 1.3 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.6, duration: 0.5 } },
];

interface Props {
  nomination: Nomination;
  index: number;
}

export default function NominationSlide({ nomination, index }: Props) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const medal = MEDALS[index % MEDALS.length];
  const medalAnim = MEDAL_ANIMATIONS[index % MEDAL_ANIMATIONS.length];
  const cardAnim = CARD_ANIMATIONS[index % CARD_ANIMATIONS.length];

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: gradient }}>

      <motion.div className="text-6xl mb-6"
        initial={medalAnim.initial} animate={medalAnim.animate}
        transition={medalAnim.transition}>
        {medal}
      </motion.div>

      <motion.p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        Рамазан үздіктері
      </motion.p>

      <motion.h2 className="text-2xl font-bold text-white mb-1"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}>
        {nomination.categoryName}
      </motion.h2>

      {nomination.meaning && (
        <motion.p className="text-white/40 text-sm mb-10 font-light"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {nomination.meaning}
        </motion.p>
      )}

      <motion.div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-6"
        initial={cardAnim.initial} animate={cardAnim.animate}
        transition={cardAnim.transition}>
        <p className="text-white/50 text-xs mb-3 tracking-widest uppercase">Үздік нәтиже</p>
        <p className="text-white text-2xl font-semibold mb-4">{nomination.winner}</p>
        <p className="text-white/30 text-xs mb-1">көрсеткіш</p>
        <p className="text-4xl font-bold text-white">
          {nomination.total.toLocaleString()}
          <span className="text-lg font-light text-white/50 ml-2">{nomination.unit || "рет"}</span>
        </p>
      </motion.div>
    </div>
  );
}
