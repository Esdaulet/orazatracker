import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { logoutUser, getMyProfile } from "../services/authService";
import { uploadProfilePhoto } from "../services/photoService";
import {
  getMyReferral,
  getMyReferrals,
  copyReferralLink,
} from "../services/referralService";
import BottomNav from "../components/BottomNav";
import { useState, useRef, useEffect } from "react";
import { Camera, HelpCircle, X } from "lucide-react";
import type { ReferralStats, ReferralItem } from "../services/referralService";

const REFERRAL_GUIDE_KEY = "referral_guide_shown";

const RAMADAN_END = new Date(2026, 2, 20); // Mar 20, 2026

function getDaysLeft(): number {
  const now = new Date();
  const diff = Math.ceil(
    (RAMADAN_END.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diff);
}

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(
    null,
  );
  const [referralList, setReferralList] = useState<ReferralItem[]>([]);
  const [referralLoading, setReferralLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.photoURL) {
      setPhotoURL(user.photoURL);
    }
    setPageLoading(false);

    // Show referral guide modal once
    if (localStorage.getItem(REFERRAL_GUIDE_KEY) !== "true") {
      setShowGuideModal(true);
    }
  }, [user?.photoURL]);

  useEffect(() => {
    const loadReferralData = async () => {
      try {
        // Call getMyProfile to trigger migration for old users (generates referralCode if missing)
        await getMyProfile();

        const [stats, list] = await Promise.all([
          getMyReferral(),
          getMyReferrals(),
        ]);
        setReferralStats(stats);
        setReferralList(list);
      } catch (error) {
        console.error("Failed to load referral data:", error);
      } finally {
        setReferralLoading(false);
      }
    };

    if (user?.uid) {
      loadReferralData();
    }
  }, [user?.uid]);

  const handleLogout = () => {
    logoutUser();
    useAuthStore.setState({ user: null });
    navigate("/login");
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadProfilePhoto(file, user!.uid);
      setPhotoURL(url);
      setUser({ ...user!, photoURL: url });
    } catch (error) {
      console.error("Фото жүктеу қатесі:", error);
      alert("Фото жүктеу сәтсіз болды");
    } finally {
      setUploading(false);
    }
  };

  const closeGuideModal = () => {
    setShowGuideModal(false);
    localStorage.setItem(REFERRAL_GUIDE_KEY, "true");
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-indigo-700 pt-12 pb-16 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-400 mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-32 bg-indigo-500 rounded mx-auto animate-pulse" />
        </div>
        <div className="px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <div className="h-3 w-20 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center py-3">
              <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <div className="h-3 w-28 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="flex justify-between items-center py-3">
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-14 w-full bg-red-50 rounded-2xl animate-pulse" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-indigo-700 pt-12 pb-16 px-4 text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full bg-indigo-400 flex items-center justify-center mx-auto text-3xl overflow-hidden">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-white rounded-full p-2 text-indigo-600 shadow-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Camera size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>
        <h1 className="text-white text-xl font-bold">{user?.displayName}</h1>
        {uploading && (
          <p className="text-indigo-200 text-xs mt-1">Жүктелуде...</p>
        )}
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h2 className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">
            Аккаунт
          </h2>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700">Аты</span>
            <span className="text-gray-900 font-medium">
              {user?.displayName}
            </span>
          </div>
          {/* <div className="flex items-center justify-between py-3">
            <span className="text-gray-700">ID</span>
            <span className="text-gray-500 text-sm font-mono">
              {user?.uid?.slice(0, 12)}...
            </span>
          </div> */}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h2 className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">
            Рамазан 2026
          </h2>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-700">🌙 Рамазан аяғына дейін</span>
            <span className="text-indigo-600 font-bold">
              {getDaysLeft()} күн
            </span>
          </div>
        </div>

        {/* Дәптер сауап - Referral Section - Premium Design */}
        {referralLoading ? (
          // Skeleton loading state
          <div className="mb-3 overflow-hidden">
            {/* Main card skeleton */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-5 mb-3 relative overflow-hidden">
              <div className="relative z-10">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-purple-500 rounded mb-2 animate-pulse" />
                    <div className="h-5 w-40 bg-purple-400 rounded animate-pulse" />
                  </div>
                  <div className="h-12 w-12 bg-purple-400 rounded-full animate-pulse" />
                </div>

                {/* Stats grid skeleton */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white bg-opacity-15 rounded-2xl p-4">
                    <div className="h-2 w-20 bg-purple-300 rounded mb-2 animate-pulse" />
                    <div className="h-6 w-16 bg-purple-300 rounded mb-2 animate-pulse" />
                    <div className="h-1 w-full bg-purple-300 rounded-full animate-pulse" />
                  </div>
                  <div className="bg-white bg-opacity-15 rounded-2xl p-4">
                    <div className="h-2 w-24 bg-purple-300 rounded mb-2 animate-pulse" />
                    <div className="h-6 w-12 bg-purple-300 rounded animate-pulse" />
                  </div>
                </div>

                {/* Code box skeleton */}
                <div className="bg-white bg-opacity-10 rounded-2xl p-4">
                  <div className="h-2 w-32 bg-purple-300 rounded mb-3 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-purple-300 rounded-xl animate-pulse" />
                    <div className="w-20 h-10 bg-white rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : referralStats ? (
          <div className="mb-3 overflow-hidden">
            {/* Main Card with Gradient */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-lg p-5 mb-3 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-purple-100 text-xs font-medium">
                      Сауап дәптері
                    </p>
                    <h2 className="text-white text-xl font-bold flex items-center gap-2 mt-0.5">
                      Сіздің сауаптарыңыз
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowGuideModal(true)}
                      className="text-white hover:text-purple-200 transition-colors"
                      title="Рефералка туралы"
                    >
                      <HelpCircle size={24} />
                    </button>
                    <div className="text-4xl">✨</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* Sawap Points */}
                  <div className="bg-white bg-opacity-15 backdrop-blur rounded-2xl p-3 border border-white border-opacity-20">
                    <p className="text-purple-100 text-xs font-medium mb-1">
                      Жиналған сауап баллдары
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {referralStats.sawapPoints}
                    </p>
                    <div className="mt-1 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (referralStats.sawapPoints / 100) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Referral Count */}
                  <div className="bg-white bg-opacity-15 backdrop-blur rounded-2xl p-3 border border-white border-opacity-20">
                    <p className="text-purple-100 text-xs font-medium mb-1">
                      Шақырған адамдар саны
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {referralStats.referralCount}
                    </p>
                    <p className="text-purple-200 text-xs mt-1">адам</p>
                  </div>
                </div>

                {/* Referral Code Box */}
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-3 border border-white border-opacity-20">
                  <p className="text-purple-100 text-xs font-medium mb-2">
                    Сіздің шақыру кодыңыз
                  </p>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-white bg-opacity-10 rounded-xl px-3 py-1.5 border border-white border-opacity-20">
                      <p className="text-white font-mono font-bold text-sm text-center tracking-widest">
                        {referralStats.referralCode}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        copyReferralLink(referralStats.referralCode);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                      className="bg-white text-indigo-600 font-bold py-1.5 px-3 text-sm rounded-xl hover:bg-opacity-90 transition-all active:scale-95 shadow-lg"
                    >
                      {copySuccess ? "✓ Көшірілді" : "📋 Көшіру"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals List */}
            {referralList.length > 0 && (
              <div className="bg-white rounded-3xl shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  Сіз шақырған қолданушылар
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    {referralList.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {referralList.map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {ref.refereeName[0]}
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold text-sm">
                            {ref.refereeName}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(ref.joinedAt).toLocaleDateString(
                              "kk-KZ",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-600 font-bold text-sm">+10</p>
                        <p className="text-gray-500 text-xs">сауап</p>{" "}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {referralList.length === 0 && (
              <div className="bg-white rounded-3xl shadow-md p-5 text-center">
                <p className="text-5xl mb-2">🤲</p>
                <p className="text-gray-700 font-semibold text-sm mb-1">
                  Әзірге сіз арқылы қосылған қолданушылар жоқ
                </p>
                <p className="text-gray-500 text-xs">
                  Шақыру кодыңызды бөлісіп, игі іске себепкер болыңыз
                </p>
              </div>
            )}
          </div>
        ) : null}

        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl border border-red-100"
        >
          Аккаунттан шығу
        </button>
      </div>

      {/* Referral Guide Modal */}
      {showGuideModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeGuideModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4  py-2 relative">
                <button
                  onClick={closeGuideModal}
                  className="absolute top-4 right-4 text-white hover:text-purple-100 transition"
                >
                  <X size={24} />
                </button>
                <h2 className="text-white text-2xl font-bold">
                  Сауап дәптері 📿
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Достарыңызды шақырып, олардың игі амалдарына себепкер болыңыз
                </p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-2.5">
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Шақыру кодыңыз арқылы қосылған әрбір қолданушы үшін сізге{" "}
                    <span className="font-semibold">+10 сауап балл</span>{" "}
                    есептеледі. Бұл — игі іске себепкер болудың бір жолы.
                  </p>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <p className="text-gray-600 text-xs font-medium mb-1">
                    Сіздің шақыру кодыңыз:
                  </p>
                  <p className="text-gray-800 font-mono font-bold text-center text-base">
                    {referralStats?.referralCode || "⏳..."}
                  </p>
                </div>

                <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  <p className="text-blue-900 text-xs">
                    💡 Шақыру кодыңызды достарыңызбен бөлісіңіз. Олар тіркелген
                    сайын сауап баллдарыңыз артады.
                  </p>
                </div>

                <button
                  onClick={closeGuideModal}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg transition-all active:scale-95 text-sm"
                >
                  Түсіндім, рахмет ✓{" "}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
