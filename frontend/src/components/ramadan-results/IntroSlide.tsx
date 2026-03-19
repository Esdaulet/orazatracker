export default function IntroSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: "linear-gradient(160deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="text-7xl mb-8">🌙</div>
      <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-4">2026</p>
      <h1 className="text-4xl font-bold text-white leading-tight mb-4">
        Рамазан<br />аяқталды
      </h1>
      <p className="text-white/50 text-base font-light mt-6">
        Осы айда не жасағаныңызды<br />бірге қарайық
      </p>
      <div className="mt-16 flex gap-1.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-1 rounded-full ${i === 0 ? "w-6 bg-white/60" : "w-1.5 bg-white/20"}`} />
        ))}
      </div>
    </div>
  );
}