import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  getCommunityProgress,
  getCachedCommunityProgress,
} from "../services/communityService";
import {
  getAsmaLeaderboard,
  getMarathonLeaderboard,
  type LeaderboardData,
} from "../services/leaderboardService";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { Heart, BookOpen, Flame } from "lucide-react";

interface CommunityMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  completedCount: number;
  completed: Array<{ id: string; name: string }>;
}

export default function CommunityProgress() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [asmaLeaderboard, setAsmaLeaderboard] = useState<LeaderboardData>({
    topList: [],
    userRank: null,
  });
  const [marathonLeaderboard, setMarathonLeaderboard] =
    useState<LeaderboardData>({ topList: [], userRank: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"progress" | "asma" | "marathon">(
    "progress"
  );

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadAllData();
  }, [user, navigate]);

  const loadAllData = async () => {
    const cached = getCachedCommunityProgress(today);
    if (cached) {
      setMembers(cached);
      setLoading(false);
    }

    try {
      const [progressData, asmaData, marathonData] = await Promise.all([
        getCommunityProgress(today),
        getAsmaLeaderboard(),
        getMarathonLeaderboard(),
      ]);

      setMembers(progressData);
      setAsmaLeaderboard(asmaData);
      setMarathonLeaderboard(marathonData);
    } catch (error) {
      console.error("Деректерді жүктеу кезінде қате:", error);
    } finally {
      setLoading(false);
    }
  };

  const LeaderboardCard = ({
    entry,
    isUserRank,
  }: {
    entry: any;
    isUserRank?: boolean;
  }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isUserRank ? "bg-indigo-50 border-2 border-indigo-300" : "bg-gray-50"
      }`}
    >
      <div className="text-2xl font-bold text-gray-400 w-8 text-center">
        {entry.medal || `#${entry.rank}`}
      </div>
      <Avatar photoURL={entry.photoURL} displayName={entry.displayName} size="sm" />
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{entry.displayName}</p>
      </div>
      <div className="text-lg font-bold text-indigo-600">{entry.score}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-12 pb-8">
          <div className="h-8 w-52 bg-indigo-500 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-indigo-400 rounded animate-pulse" />
        </div>
        {/* Member cards skeleton */}
        <div className="px-4 mt-6 flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-8 bg-indigo-100 rounded animate-pulse" />
                    <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-12 pb-8 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Heart size={28} />
          Қауымдастық
        </h1>
        <p className="text-indigo-200">Бірге өсіп, бірге жетістік табайық</p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 flex gap-0">
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex-1 py-4 px-2 font-semibold border-b-2 transition-all text-center ${
              activeTab === "progress"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Бүгін
          </button>
          <button
            onClick={() => setActiveTab("asma")}
            className={`flex-1 py-4 px-2 font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1 ${
              activeTab === "asma"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600"
            }`}
          >
            <BookOpen size={18} />
            Есімдер
          </button>
          <button
            onClick={() => setActiveTab("marathon")}
            className={`flex-1 py-4 px-2 font-semibold border-b-2 transition-all text-center flex items-center justify-center gap-1 ${
              activeTab === "marathon"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600"
            }`}
          >
            <Flame size={18} />
            Марафон
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-6 flex flex-col gap-3 pb-6">
        {/* Tab: Progress */}
        {activeTab === "progress" && (
          <>
            {members.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm mt-4">
                <Heart size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-700 font-medium">
                  Әзірге ешкім прогрес белгілемеді
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Алғаш болып бастауға болады!
                </p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.userId}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 flex items-center gap-3">
                      <Avatar
                        photoURL={member.photoURL}
                        displayName={member.displayName}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-900">
                            {member.displayName}
                          </h3>
                          {member.completedCount > 0 && (
                            <span className="text-lg">✨</span>
                          )}
                        </div>
                        <p className="text-sm text-indigo-600 font-semibold mt-1">
                          {member.completedCount} санат орындалды
                        </p>
                      </div>
                    </div>
                  </div>

                  {member.completed.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {member.completed.map((cat) => (
                        <span
                          key={cat.id}
                          className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1"
                        >
                          <span>✓</span>
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {member.completedCount === 0 && (
                    <p className="text-xs text-gray-500 italic">
                      Әлі бастамады, бірақ ниеті бар 💪
                    </p>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* Tab: Asma Leaderboard */}
        {activeTab === "asma" && (
          <>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen size={20} />
                Есімдерді үйрену рейтингі
              </h3>
              <p className="text-sm text-gray-600">
                Ең көп Алланың есімдерін үйренгендер
              </p>
            </div>

            {asmaLeaderboard.topList.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-700 font-medium">Әлі деректер жоқ</p>
              </div>
            ) : (
              <div className="space-y-2">
                {asmaLeaderboard.topList.map((entry) => (
                  <LeaderboardCard key={entry.userId} entry={entry} />
                ))}
                {asmaLeaderboard.userRank &&
                  !asmaLeaderboard.topList.find(
                    (e) => e.userId === asmaLeaderboard.userRank?.userId
                  ) && (
                    <div className="mt-6 pt-6 border-t-2 border-indigo-200">
                      <p className="text-sm text-gray-600 mb-2 font-semibold">
                        Сіздің орныңыз
                      </p>
                      <LeaderboardCard
                        entry={asmaLeaderboard.userRank}
                        isUserRank
                      />
                    </div>
                  )}
              </div>
            )}
          </>
        )}

        {/* Tab: Marathon Leaderboard */}
        {activeTab === "marathon" && (
          <>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Flame size={20} />
                Марафон рейтингі
              </h3>
              <p className="text-sm text-gray-600">
                Ең ұзақ ретін ұстаған пользователи
              </p>
            </div>

            {marathonLeaderboard.topList.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <Flame size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-700 font-medium">Әлі деректер жоқ</p>
              </div>
            ) : (
              <div className="space-y-2">
                {marathonLeaderboard.topList.map((entry) => (
                  <LeaderboardCard key={entry.userId} entry={entry} />
                ))}
                {marathonLeaderboard.userRank &&
                  !marathonLeaderboard.topList.find(
                    (e) => e.userId === marathonLeaderboard.userRank?.userId
                  ) && (
                    <div className="mt-6 pt-6 border-t-2 border-indigo-200">
                      <p className="text-sm text-gray-600 mb-2 font-semibold">
                        Сіздің орныңыз
                      </p>
                      <LeaderboardCard
                        entry={marathonLeaderboard.userRank}
                        isUserRank
                      />
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Motivation Quote */}
      {activeTab === "progress" && members.length > 0 && (
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
            <p className="text-sm text-amber-900 text-center italic">
              "Жақсылықта жарысқан жан — нағыз табысқа жетеді."
            </p>
          </div>
        </div>
      )}

      {/* Motivation for leaderboards */}
      {(activeTab === "asma" || activeTab === "marathon") && (
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
            <p className="text-sm text-blue-900 text-center italic">
              "Үздіктердің ізінің артынан барсаң, сен де үздік болар сың!"
            </p>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
