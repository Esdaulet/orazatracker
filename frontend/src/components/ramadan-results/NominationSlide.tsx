import type { Nomination } from "../../services/ramadanResultsService";

const GRADIENTS = [
  "linear-gradient(160deg, #1a0533, #3b0764, #1e1b4b)",
  "linear-gradient(160deg, #0c1a0c, #14532d, #052e16)",
  "linear-gradient(160deg, #1c0a00, #431407, #1c1917)",
  "linear-gradient(160deg, #0c0a1e, #1e1b4b, #312e81)",
  "linear-gradient(160deg, #0a1628, #1e3a5f, #0f172a)",
  "linear-gradient(160deg, #1a0a2e, #2d1b69, #0f0c29)",
];

const MEDALS = ["🥇", "🥈", "🥉", "🏅", "⭐", "✨"];

interface Props {
  nomination: Nomination;
  index: number;
}

export default function NominationSlide({ nomination, index }: Props) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const medal = MEDALS[index % MEDALS.length];

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: gradient }}>
      <div className="text-6xl mb-6">{medal}</div>

      <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-3">Номинация</p>
      <h2 className="text-2xl font-bold text-white mb-1">{nomination.categoryName}</h2>
      {nomination.meaning && (
        <p className="text-white/40 text-sm mb-10 font-light">{nomination.meaning}</p>
      )}

      <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-white/50 text-xs mb-3 tracking-widest uppercase">Чемпион</p>
        <p className="text-white text-2xl font-semibold mb-4">{nomination.winner}</p>
        <p className="text-white/30 text-xs mb-1">жалпы саны</p>
        <p className="text-4xl font-bold text-white">
          {nomination.total.toLocaleString()}
          <span className="text-lg font-light text-white/50 ml-2">рет</span>
        </p>
      </div>
    </div>
  );
}