import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, getStoredUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

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
      const user = await registerUser(phone, password, displayName);
      const storedUser = getStoredUser();
      setUser({
        uid: user.userId || user.uid,
        email: user.email || "",
        displayName,
        isAdmin: storedUser?.isAdmin || false,
      });
      navigate("/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-900 mb-2">
          Oraza App
        </h1>
        <p className="text-center text-gray-600 mb-8">Бізге қосылыңыз</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Аты-жөні
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Атыңызды енгізіңіз"
            />
          </div>

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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Құпиясөзді қайталаңыз
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Тіркелуде..." : "Тіркелу"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Аккаунтыңыз бар ма?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Кіру
          </Link>
        </p>
      </div>
    </div>
  );
}
