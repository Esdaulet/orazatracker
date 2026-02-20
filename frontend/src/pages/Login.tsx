import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { loginUser, getStoredUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  // If already logged in → redirect to dashboard
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
      return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(
        4,
        7,
      )} ${digits.slice(7)}`;
    return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(
      4,
      7,
    )} ${digits.slice(7, 9)} ${digits.slice(9)}`;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-900 mb-2">
          Oraza App
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Рамазанға арналған әдеттер трекері
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон нөмірі
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                required
                className="flex-1 px-3 py-2 outline-none rounded-lg"
                placeholder="7 777 777 77 77"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Құпиясөз
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1 px-4 py-2 outline-none rounded-lg"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Кіруде..." : "Кіру"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Аккаунтыңыз жоқ па?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Тіркелу
          </Link>
        </p>
      </div>
    </div>
  );
}
