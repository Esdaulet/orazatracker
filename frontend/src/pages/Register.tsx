import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { registerUser, getStoredUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";
import { markMemberAsNew } from "../services/newMembersService";

const BG_STYLE = {
  backgroundImage: "url('/6.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "12px",
  color: "white",
  outline: "none",
  width: "100%",
  padding: "10px 14px",
  fontSize: "15px",
};

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) setReferralCode(refParam);
  }, [searchParams]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 1) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
    if (digits.length <= 7)
      return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Құпиясөздер сәйкес келмейді");
      return;
    }
    if (password.length < 6) {
      setError("Құпиясөз кемінде 6 таңбадан тұруы керек");
      return;
    }
    setLoading(true);
    try {
      const user = await registerUser(
        phone,
        password,
        displayName,
        referralCode || undefined,
      );
      const storedUser = getStoredUser();
      setUser({
        uid: user.userId || user.uid,
        email: user.email || "",
        displayName,
        isAdmin: storedUser?.isAdmin || false,
      });
      await markMemberAsNew();
      navigate("/kadir-night");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Бұл нөмір бұрын тіркелген");
      } else {
        setError("Тіркеу кезінде қате орын алды. Қайта көріңіз");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={BG_STYLE}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-7"
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Oraza App</h1>
          <p className="text-white/50 text-sm mt-1">Бізге қосылыңыз</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
              Аты-жөні
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Атыңызды енгізіңіз"
              className="placeholder-white/80"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
              Телефон нөмірі
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
              style={inputStyle}
              placeholder="7 777 777 77 77"
              className="placeholder-white/80"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
              Шақыру коды <span className="normal-case">(міндетті емес)</span>
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              style={inputStyle}
              placeholder="ABC123"
              className="placeholder-white/80"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
              Құпиясөз
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: "44px" }}
                placeholder="••••••••"
                className="placeholder-white/80"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
              Құпиясөзді қайталаңыз
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: "44px" }}
                placeholder="••••••••"
                className="placeholder-white/80"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="text-red-300 text-sm px-3 py-2 rounded-xl"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3 rounded-xl text-white transition-all active:scale-95 disabled:opacity-50 mt-1"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {loading ? "Тіркелуде..." : "Тіркелу"}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-5">
          Аккаунтыңыз бар ма?{" "}
          <Link
            to="/login"
            className="text-white font-semibold hover:text-white/80 transition"
          >
            Кіру
          </Link>
        </p>
      </div>
    </div>
  );
}
