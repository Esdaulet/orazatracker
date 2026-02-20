import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  getWeekSurahs,
  setMySurah,
  toggleSurahLearned,
  fetchAllSurahs,
} from "../services/surahService";
import type { WeekSurahData, QuranSurah } from "../services/surahService";
import { SURAH_KAZAKH } from "../data/surahNames";
import BottomNav from "../components/BottomNav";
import { CheckCircle2, Edit2, X, Search, Clock } from "lucide-react";

const RAMADAN_START = new Date(2026, 1, 19);

function getCurrentWeekNumber(): number {
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - RAMADAN_START.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return 1;
  return Math.min(Math.ceil((diff + 1) / 7), 4);
}

function getWeekDeadline(weekNumber: number): Date {
  const deadline = new Date(RAMADAN_START);
  deadline.setDate(deadline.getDate() + weekNumber * 7);
  return deadline;
}

function getDaysUntilDeadline(weekNumber: number): number {
  const deadline = getWeekDeadline(weekNumber);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff;
}

function formatDate(date: Date): string {
  const months = [
    "қаң",
    "ақп",
    "наш",
    "сәу",
    "мамы",
    "маш",
    "шілд",
    "там",
    "қыр",
    "қазан",
    "қараш",
    "желт",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export default function SurahOfWeek() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [data, setData] = useState<WeekSurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [surahList, setSurahList] = useState<QuranSurah[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

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
      const result = await getWeekSurahs();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openPicker = async () => {
    setSearch("");
    setPickerOpen(true);
    if (surahList.length === 0) {
      setListLoading(true);
      try {
        const list = await fetchAllSurahs();
        setSurahList(list);
      } catch (e) {
        console.error(e);
      } finally {
        setListLoading(false);
      }
    }
  };

  const handleSelect = async (surah: QuranSurah) => {
    setSaving(true);
    try {
      const kazakhName = SURAH_KAZAKH[surah.number] || surah.englishName;
      const label = `${surah.number}. ${kazakhName}`;
      const saved = await setMySurah(label);
      setData((prev) =>
        prev
          ? {
              ...prev,
              mySurah: saved,
              members: prev.members.map((m) =>
                m.userId === user!.uid ? { ...m, surah: saved } : m,
              ),
            }
          : prev,
      );
      setPickerOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!data?.mySurah || toggling) return;
    setToggling(true);
    try {
      const result = await toggleSurahLearned();
      setData((prev) =>
        prev
          ? {
              ...prev,
              mySurah: prev.mySurah
                ? { ...prev.mySurah, learned: result.learned }
                : null,
              members: prev.members.map((m) =>
                m.userId === user!.uid && m.surah
                  ? { ...m, surah: { ...m.surah, learned: result.learned } }
                  : m,
              ),
            }
          : prev,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  const filtered = surahList.filter((s) => {
    const q = search.toLowerCase();
    const kaz = (SURAH_KAZAKH[s.number] || "").toLowerCase();
    return (
      s.englishName.toLowerCase().includes(q) ||
      kaz.includes(q) ||
      String(s.number).includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pb-24">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-4 pt-12 pb-8">
          <div className="h-8 w-48 bg-emerald-500 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-emerald-400 rounded animate-pulse" />
        </div>
        <div className="px-4 mt-6 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse mt-4" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  const learnedCount =
    data?.members.filter((m) => m.surah?.learned).length ?? 0;
  const weekNum = data?.weekNumber || getCurrentWeekNumber();
  const daysLeft = getDaysUntilDeadline(weekNum);
  const deadline = getWeekDeadline(weekNum);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-4 pt-12 pb-8 text-white">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          Апталық Сүре
        </h1>
        {data && (
          <>
            <p className="text-emerald-200 mb-3">
              {data.weekNumber}-апта · {learnedCount} адам жаттады
            </p>
            <div className="bg-emerald-600 bg-opacity-30 rounded-lg px-3 py-2 flex items-center gap-2 w-fit">
              <Clock size={16} />
              <span className="text-sm font-medium">
                Дедлайн: {formatDate(deadline)}
                {daysLeft > 0 ? ` (${daysLeft} күн қалды)` : " (аяқталды)"}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="px-4 mt-5 flex flex-col gap-4">
        {/* My surah card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Менің сүрем</h2>
            <button
              onClick={openPicker}
              className="flex items-center gap-1 text-emerald-600 text-sm font-semibold"
            >
              <Edit2 size={16} />
              {data?.mySurah ? "Өзгерту" : "Таңдау"}
            </button>
          </div>

          {data?.mySurah ? (
            <>
              <p className="font-semibold text-lg text-gray-800 mb-4">
                {data.mySurah.name}
              </p>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  data.mySurah.learned
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                }`}
              >
                <CheckCircle2 size={20} />
                {data.mySurah.learned ? "Жаттадым" : "Жаттадым деп белгілеу"}
              </button>
            </>
          ) : (
            <button
              onClick={openPicker}
              className="w-full py-3 bg-emerald-50 text-emerald-700 border-2 border-dashed border-emerald-200 rounded-xl font-semibold"
            >
              + Осы апта үшін сүре таңдау
            </button>
          )}
        </div>

        {/* Members list */}
        <h3 className="font-bold text-gray-700 px-1">Топ мүшелері</h3>
        {data?.members.map((member) => (
          <div
            key={member.userId}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              {member.photoURL ? (
                <img
                  src={member.photoURL}
                  alt={member.displayName}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold">
                    {member.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 truncate">
                    {member.displayName}
                  </span>
                  {member.surah?.learned && (
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 flex-shrink-0"
                    />
                  )}
                </div>
                {member.surah ? (
                  <p className="text-sm text-emerald-700 font-medium truncate">
                    {member.surah.name}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Сүре таңдамаған
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Surah picker modal */}
      {pickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div
            className="bg-white w-full rounded-t-3xl flex flex-col h-screen"
            style={{ maxHeight: "80vh" }}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-3 flex-shrink-0">
              <h2 className="text-xl font-bold">Сүре таңдау</h2>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Іздеу..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {listLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
              ) : (
                filtered.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSelect(surah)}
                    disabled={saving}
                    className="w-full flex items-center gap-3 py-3 px-2 border-b border-gray-100 text-left hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {surah.number}
                    </span>
                    <div>
                      <span className="font-medium text-gray-900">
                        {SURAH_KAZAKH[surah.number] || surah.englishName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {surah.numberOfAyahs} аят
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {surah.revelationType === "Meccan"
                            ? "Меккелік"
                            : "Мединалық"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!pickerOpen && <BottomNav />}
    </div>
  );
}
