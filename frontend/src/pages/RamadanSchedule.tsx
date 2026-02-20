import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { Moon, Sun, ArrowLeft } from "lucide-react";

interface PrayerTime {
  date: string;
  day: number;
  fajr: string;
  zuhr: string;
  asr: string;
  maghrib: string;
}

// Ramadan 2024 prayer times (March-April)
const PRAYER_TIMES: PrayerTime[] = [
  {
    date: "ақпан 19",
    day: 1,
    fajr: "05:26",
    zuhr: "12:09",
    asr: "15:47",
    maghrib: "17:31",
  },
  {
    date: "ақпан 20",
    day: 2,
    fajr: "05:25",
    zuhr: "12:09",
    asr: "15:48",
    maghrib: "17:32",
  },
  {
    date: "ақпан 21",
    day: 3,
    fajr: "05:23",
    zuhr: "12:09",
    asr: "15:49",
    maghrib: "17:34",
  },
  {
    date: "ақпан 22",
    day: 4,
    fajr: "05:22",
    zuhr: "12:09",
    asr: "15:50",
    maghrib: "17:35",
  },
  {
    date: "ақпан 23",
    day: 5,
    fajr: "05:20",
    zuhr: "12:09",
    asr: "15:52",
    maghrib: "17:36",
  },
  {
    date: "ақпан 24",
    day: 6,
    fajr: "05:19",
    zuhr: "12:09",
    asr: "15:53",
    maghrib: "17:38",
  },
  {
    date: "ақпан 25",
    day: 7,
    fajr: "05:17",
    zuhr: "12:08",
    asr: "15:54",
    maghrib: "17:39",
  },
  {
    date: "ақпан 26",
    day: 8,
    fajr: "05:16",
    zuhr: "12:08",
    asr: "15:55",
    maghrib: "17:40",
  },
  {
    date: "ақпан 27",
    day: 9,
    fajr: "05:14",
    zuhr: "12:08",
    asr: "15:56",
    maghrib: "17:41",
  },
  {
    date: "ақпан 28",
    day: 10,
    fajr: "05:13",
    zuhr: "12:08",
    asr: "15:57",
    maghrib: "17:43",
  },
  {
    date: "наурыз 1",
    day: 11,
    fajr: "05:11",
    zuhr: "12:08",
    asr: "15:58",
    maghrib: "17:44",
  },
  {
    date: "наурыз 2",
    day: 12,
    fajr: "05:09",
    zuhr: "12:07",
    asr: "16:00",
    maghrib: "17:45",
  },
  {
    date: "наурыз 3",
    day: 13,
    fajr: "05:08",
    zuhr: "12:07",
    asr: "16:01",
    maghrib: "17:47",
  },
  {
    date: "наурыз 4",
    day: 14,
    fajr: "05:06",
    zuhr: "12:07",
    asr: "16:02",
    maghrib: "17:48",
  },
  {
    date: "наурыз 5",
    day: 15,
    fajr: "05:05",
    zuhr: "12:07",
    asr: "16:03",
    maghrib: "17:49",
  },
  {
    date: "наурыз 6",
    day: 16,
    fajr: "05:03",
    zuhr: "12:07",
    asr: "16:04",
    maghrib: "17:50",
  },
  {
    date: "наурыз 7",
    day: 17,
    fajr: "05:01",
    zuhr: "12:06",
    asr: "16:05",
    maghrib: "17:51",
  },
  {
    date: "наурыз 8",
    day: 18,
    fajr: "04:59",
    zuhr: "12:06",
    asr: "16:06",
    maghrib: "17:53",
  },
  {
    date: "наурыз 9",
    day: 19,
    fajr: "04:55",
    zuhr: "12:06",
    asr: "16:07",
    maghrib: "17:54",
  },
  {
    date: "наурыз 10",
    day: 20,
    fajr: "04:56",
    zuhr: "12:06",
    asr: "16:08",
    maghrib: "17:55",
  },
  {
    date: "наурыз 11",
    day: 21,
    fajr: "04:54",
    zuhr: "12:05",
    asr: "16:09",
    maghrib: "17:56",
  },
  {
    date: "наурыз 12",
    day: 22,
    fajr: "04:52",
    zuhr: "12:05",
    asr: "16:10",
    maghrib: "17:58",
  },
  {
    date: "наурыз 13",
    day: 23,
    fajr: "04:51",
    zuhr: "12:05",
    asr: "16:11",
    maghrib: "17:59",
  },
  {
    date: "наурыз 14",
    day: 24,
    fajr: "04:49",
    zuhr: "12:05",
    asr: "16:12",
    maghrib: "18:00",
  },
  {
    date: "наурыз 15",
    day: 25,
    fajr: "04:47",
    zuhr: "12:04",
    asr: "16:13",
    maghrib: "18:01",
  },
  {
    date: "наурыз 16",
    day: 26,
    fajr: "04:45",
    zuhr: "12:04",
    asr: "16:14",
    maghrib: "18:02",
  },
  {
    date: "наурыз 17",
    day: 27,
    fajr: "04:43",
    zuhr: "12:04",
    asr: "16:15",
    maghrib: "18:04",
  },
  {
    date: "наурыз 18",
    day: 28,
    fajr: "04:41",
    zuhr: "12:03",
    asr: "16:16",
    maghrib: "18:05",
  },
  {
    date: "наурыз 19",
    day: 29,
    fajr: "04:40",
    zuhr: "12:03",
    asr: "16:17",
    maghrib: "18:06",
  },
];

function getTodayIndex(): number {
  const ramadanStart = new Date(2026, 1, 19); // Feb 19, 2026
  const diff = Math.floor(
    (new Date().getTime() - ramadanStart.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff >= 0 && diff < PRAYER_TIMES.length) return diff;
  return 0;
}

export default function RamadanSchedule() {
  const navigate = useNavigate();
  const todayIndex = getTodayIndex();
  const today = PRAYER_TIMES[todayIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-12 pb-8 text-white">
        <div className="flex items-center gap-2 ">
          <button
            onClick={() => navigate("/dashboard")}
            className="  hover:bg-indigo-600 rounded transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            Рамазан кестесі
          </h1>
        </div>
        <p className="text-indigo-200">Ораза уақыты</p>
      </div>

      {/* Today's Times */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-500 text-sm mb-1">{today.date}</p>
            <p className="text-indigo-600 font-bold text-lg">
              Рамазан {today.day} күн
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <div className="text-gray-600 text-xs mb-2 flex items-center justify-center gap-1">
                <Moon size={14} />
                Ауыз бекіту
              </div>
              <p className="text-2xl font-bold text-orange-600">{today.fajr}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
              <div className="text-gray-600 text-xs mb-2 flex items-center justify-center gap-1">
                <Sun size={14} />
                Ауызашар
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {today.maghrib}
              </p>
            </div>
          </div>
        </div>

        {/* All Prayer Times */}
        <h2 className="font-bold text-gray-900 mb-3">Барлық намаз уақыты</h2>
        <div className="flex flex-col gap-2">
          {PRAYER_TIMES.map((time, idx) => {
            const isToday = idx === todayIndex;
            return (
              <div
                key={idx}
                className={`rounded-lg p-3 transition-all ${
                  isToday
                    ? "bg-indigo-100 border-2 border-indigo-500"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${isToday ? "text-indigo-600" : "text-gray-900"}`}
                    >
                      {time.date} {isToday && "← Бүгін"}
                    </p>
                    <p className="text-xs text-gray-500">Рамазан {time.day}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-mono text-gray-700 flex items-center justify-end gap-2">
                      <span className="flex items-center gap-1">
                        <Moon size={14} />
                        {time.fajr}
                      </span>
                      |
                      <span className="flex items-center gap-1">
                        <Sun size={14} />
                        {time.maghrib}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
