import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Lottie from "lottie-react";
import { X } from "lucide-react";
import annosAnimation from "../assets/annons.json";

const STORAGE_KEY = "asma_al_husna_announcement_dismissed";
// Show announcement to users created before 2026-02-21 (i.e., existing users on Feb 20 and earlier)
const FEATURE_ADDED_DATE = new Date("2026-02-21").getTime();

export default function AsmaAlHusnaBanner() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  });

  // Only show for existing users (registered before feature was added)
  if (!user || !user.createdAt || user.createdAt >= FEATURE_ADDED_DATE) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleNavigate = () => {
    navigate("/asma");
    handleDismiss();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleDismiss} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition"
          >
            <X size={24} className="text-gray-600" />
          </button>

          {/* Lottie Animation */}
          <div className="w-full h-64 bg-gray-150">
            <Lottie
              animationData={annosAnimation}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Алланың 99 көркем есімі
            </h2>
            <p className="text-gray-600 mb-6 text-sm text-center">
              Рамазан айында күн сайын 3 көркем есімді үйреніп, флеш-карталар
              арқылы есте сақтап, мағынасын жүрегіңізге сіңіріңіз
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleNavigate}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all active:scale-95"
              >
                Басыңыз →
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all active:scale-95"
              >
                Кейінге
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
