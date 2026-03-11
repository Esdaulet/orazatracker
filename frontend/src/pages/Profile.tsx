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

const BG_STYLE = {
  backgroundImage: "url('/masjid1.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const glass = {
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.18)",
};

const glassDark = {
  background: "rgba(0,0,0,0.3)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.12)",
};

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
      <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 pt-16 pb-8 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-32 bg-white/20 rounded mx-auto animate-pulse" />
        </div>
        <div className="relative z-10 px-4 flex flex-col gap-3">
          <div className="rounded-2xl p-4" style={glass}>
            <div className="h-3 w-20 bg-white/20 rounded mb-4 animate-pulse" />
            <div className="h-4 w-full bg-white/15 rounded animate-pulse mb-3" />
            <div className="h-4 w-3/4 bg-white/15 rounded animate-pulse" />
          </div>
          <div className="rounded-2xl p-4" style={glass}>
            <div className="h-3 w-28 bg-white/20 rounded mb-4 animate-pulse" />
            <div className="h-4 w-full bg-white/15 rounded animate-pulse" />
          </div>
          <div
            className="h-14 w-full rounded-2xl animate-pulse"
            style={{ background: "rgba(239,68,68,0.15)" }}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative" style={BG_STYLE}>
      <div className="absolute inset-0 bg-black/50" />

      {/* Header / Avatar */}
      <div className="relative z-10 pt-16 pb-8 px-4 text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto text-3xl overflow-hidden border-2 border-white/30">
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
            className="absolute bottom-0 right-0 rounded-full p-1.5 text-white shadow-md disabled:opacity-50"
            style={glass}
          >
            <Camera size={14} />
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
          <p className="text-white/50 text-xs mt-1">Жүктелуде...</p>
        )}
      </div>

      <div className="relative z-10 px-4 flex flex-col gap-3">
        {/* Account card */}
        <div className="rounded-2xl p-4" style={glassDark}>
          <h2 className="text-white text-xs font-medium mb-3 uppercase tracking-wide">
            Аккаунт
          </h2>
          <div className="flex items-center justify-between py-2.5 border-b border-white/10">
            <span className="text-white/70">Аты</span>
            <span className="text-white font-medium">{user?.displayName}</span>
          </div>
        </div>

        {/* Ramadan countdown */}
        <div className="rounded-2xl p-4" style={glassDark}>
          <h2 className="text-white text-xs font-medium mb-3 uppercase tracking-wide">
            Рамазан 2026
          </h2>
          <div className="flex items-center justify-between py-2">
            <span className="text-white/70">🌙 Рамазан аяғына дейін</span>
            <span className="text-white font-bold">{getDaysLeft()} күн</span>
          </div>
        </div>

        {/* Referral section */}
        {referralLoading ? (
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(99,60,180,0.35)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-3 w-24 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-5 w-40 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div className="h-2 w-20 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-6 w-16 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-1 w-full bg-white/20 rounded-full animate-pulse" />
              </div>
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div className="h-2 w-24 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-6 w-12 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div className="h-2 w-32 bg-white/20 rounded mb-3 animate-pulse" />
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-white/15 rounded-xl animate-pulse" />
                <div className="w-24 h-10 bg-white/20 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        ) : referralStats ? (
          <>
            {/* Main referral card */}
            <div
              className="rounded-3xl p-5 relative overflow-hidden"
              style={{
                background: "rgba(88,40,200,0.4)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(139,92,246,0.35)",
              }}
            >
              {/* decorations */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/60 text-xs font-medium">
                      Сауап дәптері
                    </p>
                    <h2 className="text-white text-xl font-bold mt-0.5">
                      Сіздің сауаптарыңыз
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowGuideModal(true)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <HelpCircle size={24} />
                    </button>
                    <div className="text-4xl">✨</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div
                    className="rounded-2xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <p className="text-white text-xs font-medium mb-1">
                      Жиналған сауап баллдары
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {referralStats.sawapPoints}
                    </p>
                    <div className="mt-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-500"
                        style={{
                          width: `${Math.min((referralStats.sawapPoints / 100) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <p className="text-white text-xs font-medium mb-1">
                      Шақырған адамдар саны
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {referralStats.referralCount}
                    </p>
                    <p className="text-white/50 text-xs mt-1">адам</p>
                  </div>
                </div>

                {/* Referral code */}
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <p className="text-white text-xs font-medium mb-2">
                    Сіздің шақыру кодыңыз
                  </p>
                  <div className="flex gap-2 items-center">
                    <div
                      className="flex-1 rounded-xl px-3 py-1.5"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
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
                      className="bg-white text-indigo-700 font-bold py-1.5 px-3 text-sm rounded-xl hover:bg-opacity-90 transition-all active:scale-95"
                    >
                      {copySuccess ? "✓ Көшірілді" : "📋 Көшіру"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals list */}
            {referralList.length > 0 && (
              <div className="rounded-3xl p-4" style={glassDark}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">
                    Сіз шақырған қолданушылар
                  </span>
                  <span
                    className="text-xs font-bold px-3 py-0.5 rounded-full text-white"
                    style={{
                      background: "rgba(139,92,246,0.4)",
                      border: "1px solid rgba(139,92,246,0.4)",
                    }}
                  >
                    {referralList.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {referralList.map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl"
                      style={{
                        background: "rgba(139,92,246,0.15)",
                        border: "1px solid rgba(139,92,246,0.2)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: "rgba(139,92,246,0.5)" }}
                        >
                          {ref.refereeName[0]}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {ref.refereeName}
                          </p>
                          <p className="text-white/40 text-xs">
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
                        <p className="text-purple-300 font-bold text-sm">+10</p>
                        <p className="text-white/40 text-xs">сауап</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {referralList.length === 0 && (
              <div className="rounded-3xl p-5 text-center" style={glassDark}>
                <p className="text-4xl mb-2">🤲</p>
                <p className="text-white font-semibold text-sm mb-1">
                  Әзірге сіз арқылы қосылған қолданушылар жоқ
                </p>
                <p className="text-white/40 text-xs">
                  Шақыру кодыңызды бөлісіп, игі іске себепкер болыңыз
                </p>
              </div>
            )}
          </>
        ) : null}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full font-bold py-4 rounded-2xl text-white transition-all active:scale-95"
          style={{
            background: "rgba(239,68,68,0.80)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          Аккаунттан шығу
        </button>
      </div>

      {/* Referral Guide Modal */}
      {showGuideModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={closeGuideModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: "rgba(20,10,50,0.85)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(139,92,246,0.35)",
              }}
            >
              <div
                className="px-5 py-4 relative"
                style={{
                  background: "rgba(88,40,200,0.4)",
                  borderBottom: "1px solid rgba(139,92,246,0.25)",
                }}
              >
                <button
                  onClick={closeGuideModal}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition"
                >
                  <X size={22} />
                </button>
                <h2 className="text-white text-xl font-bold">
                  Сауап дәптері 📿
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Достарыңызды шақырып, олардың игі амалдарына себепкер болыңыз
                </p>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-white/80 text-sm leading-relaxed">
                  Шақыру кодыңыз арқылы қосылған әрбір қолданушы үшін сізге{" "}
                  <span className="text-white font-semibold">
                    +10 сауап балл
                  </span>{" "}
                  есептеледі.
                </p>
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <p className="text-white/50 text-xs font-medium mb-1">
                    Сіздің шақыру кодыңыз:
                  </p>
                  <p className="text-white font-mono font-bold text-center text-base tracking-widest">
                    {referralStats?.referralCode || "⏳..."}
                  </p>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.25)",
                  }}
                >
                  <p className="text-white/70 text-xs">
                    💡 Шақыру кодыңызды достарыңызбен бөлісіңіз. Олар тіркелген
                    сайын сауап баллдарыңыз артады.
                  </p>
                </div>
                <button
                  onClick={closeGuideModal}
                  className="w-full font-semibold py-2.5 rounded-xl text-white transition-all active:scale-95 text-sm"
                  style={{
                    background: "rgba(139,92,246,0.5)",
                    border: "1px solid rgba(139,92,246,0.4)",
                  }}
                >
                  Түсіндім, рахмет ✓
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
