import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCommunityProgress, getCachedCommunityProgress } from "../services/communityService";
import BottomNav from "../components/BottomNav";
import { Users, Heart } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadCommunityProgress();
  }, [user, navigate]);

  const loadCommunityProgress = async () => {
    const cached = getCachedCommunityProgress(today);
    if (cached) {
      setMembers(cached);
      setLoading(false);
    }
    try {
      const data = await getCommunityProgress(today);
      setMembers(data);
    } catch (error) {
      console.error("Қауымдастық прогресін жүктеу кезінде қате:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users size={32} />
          Қауымдастық прогресі
        </h1>
        <p className="text-indigo-200">Бүгінгі жетістіктер</p>
      </div>

      {/* Members List */}
      <div className="px-4 mt-6 flex flex-col gap-3 pb-6">
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
          members.map((member, idx) => (
            <div
              key={member.userId}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 flex items-center gap-3">
                  {member.photoURL && (
                    <img
                      src={member.photoURL}
                      alt={member.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        #{idx + 1}
                      </span>
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
      </div>

      {/* Motivation Quote */}
      {members.length > 0 && (
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
            <p className="text-sm text-amber-900 text-center italic">
              "Жақсылықта жарысқан жан — нағыз табысқа жетеді."
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
