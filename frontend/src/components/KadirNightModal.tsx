import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface KadirSlide {
  title: string;
  description: string;
}

const KADIR_FACTS: KadirSlide[] = [
  {
    title: "Мың айдың сауабы — бір түнде",
    description:
      "Бүгін — уақыт пен кеңістік заңдылықтары тоқтайтын түн. \n\n«Қадір түні мың айдан да қайырлы» (97:3). Бұл дегеніміз — бүгінгі бір түн бүкіл саналы ғұмырыңызға (83 жылға) татиды деген сөз.\n\nСіз жай ғана түн өткізіп жатқан жоқсыз, сіз бүкіл өміріңіздің тағдырын өзгертетін мүмкіндіктің үстінде тұрсыз. ✨",
  },
  {
    title: "Құран түсірілген түн",
    description:
      "«Ақиқатында, Біз Құранды Қадір түнінде түсірдік» (Құран, 97:1)\n\nҚасиетті Құран Кәрім осы түнде көктен жерге түсіріле бастаған.",
  },
  {
    title: "Түннің басты дұғасы",
    description:
      "«Аллаһумма иннәкә 'афуун, тухиббул 'афуа фа'фу 'анни»\n\n(Иә, Алла! Сен Кешірімдісің, кешіруді жақсы көресің, мені кешіре көр!)",
  },
  {
    title: "Түнді іздеу",
    description:
      "Қадір түні Рамазан айының соңғы 10 түнінің бірінде жасырылған. \n\nМүфтият бекіткен кесте бойынша биылғы Қадір түні 16-нан 17-ші наурызға қараған түнге сәйкес келеді.",
  },
  {
    title: "Періштелердің түсуі",
    description:
      "«Періштелер мен Жебірейіл (ғ.с) ол кеште Раббыларының рұқсатымен барлық іс үшін (жерге) түседі» (Құран, 97:4)",
  },
  {
    title: "Бейбітшілік пен тыныштық",
    description:
      "«Ол түн таң атқанша бейбітшілік пен амандыққа толы болады» (Құран, 97:5)\n\nБұл — дұғалар мен тілектердің орындалатын, жүректер тыныштық табатын уақыты.",
  },
  {
    title: "Шексіздік түні",
    description:
      "Күнделікті жасап жүрген «100 қайталау» немесе үйреншікті нормалар — бұл түні жай ғана сан болып қалады.\n\n" +
      "Бүгін шектеуді алып тастаңыз! Қадір түніндегі құлшылықтың шегі жоқ. Шын жүректен шыққан әрбір зікір мен дұғаны шексіз жасасаңыз да артық етпейді. \n\n" +
      "Бүгін — сауаптың «лимитсіз» уақыты. Мүмкіндікті барынша пайдаланыңыз!",
  },
];

interface KadirNightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KadirNightModal({
  isOpen,
  onClose,
}: KadirNightModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);

  if (!isOpen) return null;

  const handleNextSlide = () => {
    if (currentSlide < KADIR_FACTS.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNextSlide();
      else handlePrevSlide();
    }
  };

  const slide = KADIR_FACTS[currentSlide];
  const isLastSlide = currentSlide === KADIR_FACTS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div
        className="bg-white/15 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-white/30"
        style={{ backdropFilter: "blur(30px)" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-2 border-b border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div className="text-2xl">🌙</div>
          </div>
          <h2 className="text-2xl font-semibold text-white">{slide.title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 min-h-32">
          <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
            {slide.description}
          </p>
        </div>

        {/* Dots */}
        <div className="px-6 py-4 flex justify-center gap-1.5 border-t border-white/20">
          {KADIR_FACTS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide ? "bg-white w-6" : "bg-white/40 w-1.5"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex justify-between   items-center">
          <button
            onClick={handlePrevSlide}
            className="text-white/60 hover:text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-full transition"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-white/70 text-xs">
            {currentSlide + 1} / {KADIR_FACTS.length}
          </span>

          <button
            onClick={handleNextSlide}
            className="text-white/60 hover:text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-full transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Close Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            disabled={!isLastSlide}
            className={`w-full py-2.5 text-sm font-medium rounded-lg transition border ${
              isLastSlide
                ? "bg-white/20 hover:bg-white/30 text-white border-white/30 cursor-pointer"
                : "bg-white/10 text-white/40 border-white/20 cursor-not-allowed"
            }`}
          >
            Түсінікті, рақмет{" "}
          </button>
        </div>
      </div>
    </div>
  );
}
