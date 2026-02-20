import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCurrentSurah, toggleSurahLearned } from "../services/surahService";
import type { SurahData } from "../services/surahService";
import BottomNav from "../components/BottomNav";
import { BookOpen, CheckCircle2, Users } from "lucide-react";

export default function SurahOfWeek() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [data, setData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getCurrentSurah();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!data?.surah || toggling) return;
    setToggling(true);
    try {
      const result = await toggleSurahLearned();
      setData((prev) =>
        prev
          ? {
              ...prev,
              myLearned: result.learned,
              learners: result.learned
                ? [
                    ...prev.learners,
                    {
                      userId: user!.uid,
                      displayName: user!.displayName,
                      photoURL: user!.photoURL,
                    },
                  ]
                : prev.learners.filter((l) => l.userId !== user!.uid),
            }
          : prev
      );
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pb-24">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-4 pt-12 pb-8">
          <div className="h-8 w-48 bg-emerald-500 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-emerald-400 rounded animate-pulse" />
        </div>
        <div className="px-4 mt-6 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-3" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-4 pt-12 pb-8 text-white">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <BookOpen size={32} />
          Апталық Сүре
        </h1>
        {data && (
          <p className="text-emerald-200">{data.weekNumber}-апта · Рамазан 2026</p>
        )}
      </div>

      <div className="px-4 mt-6 flex flex-col gap-4">
        {!data?.surah ? (
          /* No surah set yet */
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-700 font-medium">Сүре әлі белгіленбеген</p>
            <p className="text-gray-400 text-sm mt-1">
              Админ жақында белгілейді
            </p>
          </div>
        ) : (
          <>
            {/* Surah Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {data.surah.name}
              </h2>

              {data.surah.transliteration && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                    Транслитерация
                  </p>
                  <p className="text-gray-700 italic leading-relaxed">
                    {data.surah.transliteration}
                  </p>
                </div>
              )}

              {data.surah.kazakh && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                    Қазақша мағынасы
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    {data.surah.kazakh}
                  </p>
                </div>
              )}

              {/* Learned button */}
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`w-full py-3 rounded-xl font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  data.myLearned
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                }`}
              >
                <CheckCircle2 size={20} />
                {data.myLearned ? "Жаттадым ✓" : "Жаттадым деп белгілеу"}
              </button>
            </div>

            {/* Learners */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-emerald-600" />
                Кім жаттады ({data.learners.length})
              </h3>

              {data.learners.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">
                  Әлі ешкім белгілемеді — алғаш бол!
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.learners.map((learner) => (
                    <div key={learner.userId} className="flex items-center gap-3">
                      {learner.photoURL ? (
                        <img
                          src={learner.photoURL}
                          alt={learner.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-bold text-sm">
                            {learner.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-800">
                        {learner.displayName}
                      </span>
                      <CheckCircle2
                        size={16}
                        className="ml-auto text-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}