import type { RamadanResults } from "../../services/ramadanResultsService";

interface Props {
  data: RamadanResults;
}

export default function ActiveDaysSlide({ data }: Props) {
  const percent = Math.round((data.activeDays / data.totalRamadanDays) * 100);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: "linear-gradient(160deg, #0a0a0a, #1a1a2e, #16213e)" }}>
      <p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-12">Сіздің нәтижеңіз</p>

      <div className="mb-2">
        <span className="text-8xl font-bold text-white">{data.activeDays}</span>
      </div>
      <p className="text-white/70 text-xl mb-10">күн белсенді болдыңыз</p>
      <p className="text-white/40 text-sm">30 күннің {percent}%</p>

      <div className="w-full max-w-xs mt-10 space-y-4">
        <StatRow label="99 есімі" value={`${data.asmaLearned} / 99`} />
        <StatRow label="Квиз рет" value={`${data.quiz.totalQuizzes} рет`} />
        <StatRow label="Квиз үздік" value={`${data.quiz.bestScore}/10`} />
      </div>
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