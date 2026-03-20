import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  getCommunityProgress,
  getCachedCommunityProgress,
} from "../services/communityService";
import {
  getAllLeaderboards,
  type LeaderboardData,
  type SprintLeaderboardData,
} from "../services/leaderboardService";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { Heart, Brain, Zap, Flame } from "lucide-react";
import type { LeaderboardEntry } from "../services/leaderboardService";

interface CommunityMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  completedCount: number;
  completed: Array<{ id: string; name: string }>;
}

const BG_STYLE = {
  backgroundImage: "url('/3.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const glass = {
  background: "rgba(0,0,0,0.3)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const glassLight = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.15)",
};

export default function CommunityProgress() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [marathonLeaderboard, setMarathonLeaderboard] =
    useState<LeaderboardData>({ topList: [], userRank: null });
  const [sprintLeaderboard, setSprintLeaderboard] =
    useState<SprintLeaderboardData>({
      topList: [],
      userRank: null,
      daysRemaining: 0,
      weekStart: "",
      weekEnd: "",
    });
  const [quizLeaderboard, setQuizLeaderboard] = useState<LeaderboardData>({
    topList: [],
    userRank: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "progress" | "asma" | "marathon" | "sprint" | "quiz"
  >(
    ((location.state as { tab?: string })?.tab as
      | "progress"
      | "asma"
      | "marathon"
      | "sprint"
      | "quiz") || "sprint",
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
      const [progressData, leaderboards] = await Promise.all([
        getCommunityProgress(today),
        getAllLeaderboards(),
      ]);
      setMembers(progressData);
      setMarathonLeaderboard(leaderboards.marathon);
      setSprintLeaderboard(leaderboards.sprint);
      setQuizLeaderboard(leaderboards.quiz);
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
    entry: LeaderboardEntry;
    isUserRank?: boolean;
  }) => (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={
        isUserRank
          ? {
              background: "rgba(99,102,241,0.25)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(99,102,241,0.5)",
            }
          : glassLight
      }
    >
      <div className="text-xl font-bold text-white/50 w-8 text-center">
        {entry.medal || `#${entry.rank}`}
      </div>
      <Avatar
        photoURL={entry.photoURL}
        displayName={entry.displayName}
        size="sm"
      />
      <div className="flex-1">
        <p className="font-semibold text-white">{entry.displayName}</p>
      </div>
      <div className="text-lg font-bold text-white">{entry.score}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4 pt-12 pb-8">
          <div className="h-8 w-52 bg-white/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-white/15 rounded animate-pulse" />
        </div>
        <div className="relative z-10 px-4 flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl p-4" style={glass}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 w-28 bg-white/20 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-white/15 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-white/15 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-white/15 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
      <div className="absolute inset-0 bg-black/50" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Heart size={26} />
          Қауымдастық
        </h1>
        <p className="text-white/50 text-sm">
          Бірге өсіп, бірге жетістік табайық
        </p>
      </div>

      {/* Tabs */}
      <div
        className="sticky top-0 z-20 px-4"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex">
          {[
            { id: "progress", label: "Бүгін" },
            { id: "sprint", label: "Спринт", icon: <Zap size={15} /> },
            { id: "quiz", label: "Куиз", icon: <Brain size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | "progress"
                    | "asma"
                    | "marathon"
                    | "sprint"
                    | "quiz",
                )
              }
              className={`flex-1 py-3.5 flex items-center justify-center gap-1 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-white text-white"
                  : "border-transparent text-white/40"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 mt-4 flex flex-col gap-3 pb-6">
        {/* Tab: Progress */}
        {activeTab === "progress" && (
          <>
            {members.length === 0 ? (
              <div className="rounded-2xl p-8 text-center mt-4" style={glass}>
                <Heart size={40} className="mx-auto mb-3 text-white/30" />
                <p className="text-white font-medium">
                  Әзірге ешкім прогрес белгілемеді
                </p>
                <p className="text-white/40 text-sm mt-1">
                  Алғаш болып бастауға болады!
                </p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.userId}
                  className="rounded-2xl p-4"
                  style={glass}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        photoURL={member.photoURL}
                        displayName={member.displayName}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">
                            {member.displayName}
                          </h3>
                          {member.completedCount > 0 && <span>✨</span>}
                        </div>
                        <p className="text-sm text-white/60 mt-0.5">
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
                          className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"
                          style={{
                            background: "rgba(34,197,94,0.2)",
                            color: "rgba(134,239,172,1)",
                            border: "1px solid rgba(34,197,94,0.3)",
                          }}
                        >
                          ✓ {cat.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {member.completedCount === 0 && (
                    <p className="text-xs text-white/30 italic">
                      Әлі бастамады, бірақ ниеті бар 💪
                    </p>
                  )}
                </div>
              ))
            )}
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            >
              <p className="text-sm text-white italic">
                "Жақсылықта жарысқан жан — нағыз табысқа жетеді."
              </p>
            </div>
          </>
        )}

        {/* Tab: Sprint */}
        {activeTab === "sprint" && loading && (
          <>
            <div
              className="rounded-2xl p-4 mb-2"
              style={{
                background: "rgba(234,179,8,0.15)",
                border: "1px solid rgba(234,179,8,0.3)",
              }}
            >
              <div className="h-5 w-36 bg-white/20 rounded animate-pulse mb-2" />
              <div className="h-4 w-52 bg-white/15 rounded animate-pulse mb-2" />
              <div className="h-6 w-40 bg-yellow-400/20 rounded-full animate-pulse" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={glassLight}
              >
                <div className="w-8 h-6 bg-white/20 rounded animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-28 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="h-5 w-6 bg-white/20 rounded animate-pulse" />
              </div>
            ))}
          </>
        )}

        {activeTab === "sprint" && !loading && (
          <>
            <div
              className="rounded-2xl p-4 mb-2"
              style={{
                background: "rgba(234,179,8,0.15)",
                border: "1px solid rgba(234,179,8,0.3)",
              }}
            >
              <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" /> Апталық спринт
              </h3>
              <p className="text-sm text-white/80">
                Осы аптада толық орындалған күндер (дүйсенбі – жексенбі)
              </p>
              {sprintLeaderboard.daysRemaining > 0 && (
                <div
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(234,179,8,0.25)",
                    color: "#fde68a",
                    border: "1px solid rgba(234,179,8,0.4)",
                  }}
                >
                  ⏳ Аптаның соңына дейін {sprintLeaderboard.daysRemaining} күн
                  қалды
                </div>
              )}
            </div>
            {sprintLeaderboard.topList.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={glass}>
                <Zap size={40} className="mx-auto mb-3 text-white/30" />
                <p className="text-white font-medium">Әлі деректер жоқ</p>
                <p className="text-white/40 text-sm mt-1">Бүгін бастаңыз!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sprintLeaderboard.topList.map((entry) => (
                  <LeaderboardCard
                    key={entry.userId}
                    entry={entry}
                    isUserRank={entry.userId === user?.uid}
                  />
                ))}
                {sprintLeaderboard.userRank &&
                  !sprintLeaderboard.topList.find(
                    (e) => e.userId === sprintLeaderboard.userRank?.userId,
                  ) && (
                    <div
                      className="mt-4 pt-4"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <p className="text-sm text-white/50 mb-2 font-semibold">
                        Сіздің орныңыз
                      </p>
                      <LeaderboardCard
                        entry={sprintLeaderboard.userRank}
                        isUserRank
                      />
                    </div>
                  )}
              </div>
            )}
          </>
        )}

        {/* Tab: Marathon */}
        {activeTab === "marathon" && (
          <>
            <div
              className="rounded-2xl p-4 mb-2"
              style={{
                background: "rgba(249,115,22,0.15)",
                border: "1px solid rgba(249,115,22,0.25)",
              }}
            >
              <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                <Flame size={18} /> Марафон рейтингі
              </h3>
              <p className="text-sm text-white">
                Ең ұзақ сериялық күндер қатарын сақтаған қолданушылар
              </p>
            </div>
            {marathonLeaderboard.topList.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={glass}>
                <Flame size={40} className="mx-auto mb-3 text-white/30" />
                <p className="text-white font-medium">Әлі деректер жоқ</p>
              </div>
            ) : (
              <div className="space-y-2">
                {marathonLeaderboard.topList.map((entry) => (
                  <LeaderboardCard key={entry.userId} entry={entry} />
                ))}
                {marathonLeaderboard.userRank &&
                  !marathonLeaderboard.topList.find(
                    (e) => e.userId === marathonLeaderboard.userRank?.userId,
                  ) && (
                    <div
                      className="mt-4 pt-4"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <p className="text-sm text-white/50 mb-2 font-semibold">
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

        {/* Tab: Quiz */}
        {activeTab === "quiz" && (
          <>
            <div
              className="rounded-2xl p-4 mb-2"
              style={{
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.25)",
              }}
            >
              <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                <Brain size={18} /> Куиз рейтингі
              </h3>
              <p className="text-sm text-white">
                Ең жоғары квиз ұпайлары бар қолданушылар
              </p>
            </div>
            {quizLeaderboard.topList.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={glass}>
                <Brain size={40} className="mx-auto mb-3 text-white/30" />
                <p className="text-white font-medium">Әлі деректер жоқ</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quizLeaderboard.topList.map((entry) => (
                  <LeaderboardCard key={entry.userId} entry={entry} />
                ))}
                {quizLeaderboard.userRank &&
                  !quizLeaderboard.topList.find(
                    (e) => e.userId === quizLeaderboard.userRank?.userId,
                  ) && (
                    <div
                      className="mt-4 pt-4"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <p className="text-sm text-white/50 mb-2 font-semibold">
                        Сіздің орныңыз
                      </p>
                      <LeaderboardCard
                        entry={quizLeaderboard.userRank}
                        isUserRank
                      />
                    </div>
                  )}
              </div>
            )}
          </>
        )}

        {(activeTab === "sprint" ||
          activeTab === "marathon" ||
          activeTab === "quiz") && (
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: "rgba(99,102,241,0.60)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <p className="text-sm text-white italic">
              "Үздіктердің ізінің артынан барсаң, сен де үздік боларсың!"
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
