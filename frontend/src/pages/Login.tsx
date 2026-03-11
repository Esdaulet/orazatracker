import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { loginUser, getStoredUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";

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

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  if (getStoredUser()) {
    return <Navigate to="/dashboard" replace />;
  }

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
    setLoading(true);
    try {
      const user = await loginUser(phone, password);
      const storedUser = getStoredUser();
      setUser({
        uid: user.userId || user.uid,
        email: user.email || "",
        displayName: user.displayName || "Пайдаланушы",
        isAdmin: storedUser?.isAdmin || false,
      });
      navigate("/dashboard");
    } catch {
      setError("Телефон нөмірі немесе құпиясөз қате");
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
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-white">Oraza App</h1>
          <p className="text-white/50 text-sm mt-1">
            Рамазанға арналған әдеттер трекері
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full font-bold py-3 rounded-xl text-white transition-all active:scale-95 disabled:opacity-50 mt-2"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {loading ? "Кіруде..." : "Кіру"}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Аккаунтыңыз жоқ па?{" "}
          <Link
            to="/register"
            className="text-white font-semibold hover:text-white/80 transition"
          >
            Тіркелу
          </Link>
        </p>
      </div>
    </div>
  );
}
