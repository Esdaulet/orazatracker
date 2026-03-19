import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { getStoredUser, getMyProfile } from "./services/authService";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import CategoryCounter from "./pages/CategoryCounter";
import RamadanSchedule from "./pages/RamadanSchedule";
import CommunityProgress from "./pages/CommunityProgress";
import SurahOfWeek from "./pages/SurahOfWeek";
import Analytics from "./pages/Analytics";
import AsmaAlHusna from "./pages/AsmaAlHusna";
import FirstThreeNames from "./pages/FirstThreeNames";
import Quiz from "./pages/Quiz";
import KadirNight from "./pages/KadirNight";
import RamadanResults from "./pages/RamadanResults";
import RouteTracker from "./components/RouteTracker";
import Dashboard from "./pages/Dashboard";
import { useNavigate, useLocation } from "react-router-dom";

function RamadanResultsGate() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const seen = localStorage.getItem("ramadan2026_results_seen");
    if (!seen && location.pathname !== "/ramadan-results") {
      navigate("/ramadan-results", { replace: true });
    }
  }, [user, navigate, location.pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden">
        <audio src="/14.mp3" autoPlay />
        <img
          src="/10.gif"
          alt=""
          style={{ width: "100%", height: "100vh", objectFit: "cover" }}
        />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // Check token immediately — don't wait for animation
    const storedUser = getStoredUser();

    if (!storedUser) {
      // No valid token → stop loading, ProtectedRoute will redirect to login
      setLoading(false);
      return;
    }

    // Read cached photoURL from localStorage (no network request needed)
    const cachedPhotoURL = localStorage.getItem("photoURL") || undefined;

    // Token exists → set user immediately so ProtectedRoute allows access
    const base = {
      uid: storedUser.userId,
      email: "",
      displayName: storedUser.displayName || "User",
      isAdmin: storedUser.isAdmin || false,
      photoURL: cachedPhotoURL,
    };
    setUser(base);

    // Show animation for 2 seconds, then refresh profile in background
    const timer = setTimeout(() => {
      setLoading(false);
      // Only fetch if no cached photo, or refresh in background
      getMyProfile()
        .then((profile) => {
          if (profile?.photoURL) {
            localStorage.setItem("photoURL", profile.photoURL);
            if (profile.photoURL !== cachedPhotoURL) {
              setUser({ ...base, photoURL: profile.photoURL });
            }
          }
        })
        .catch(() => {
          /* ignore */
        });
    }, 4000);

    return () => clearTimeout(timer);
  }, [setUser, setLoading]);

  return (
    <Router>
      <RouteTracker />
      <RamadanResultsGate />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <RamadanSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counter/:categoryId"
          element={
            <ProtectedRoute>
              <CategoryCounter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/names/:categoryId"
          element={
            <ProtectedRoute>
              <FirstThreeNames />
            </ProtectedRoute>
          }
        />
        <Route
          path="/surah"
          element={
            <ProtectedRoute>
              <SurahOfWeek />
            </ProtectedRoute>
          }
        />
        <Route
          path="/asma"
          element={
            <ProtectedRoute>
              <AsmaAlHusna />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <KadirNight />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ramadan-results"
          element={
            <ProtectedRoute>
              <RamadanResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <Navigate
              to={(() => {
                const seen = localStorage.getItem("ramadan2026_results_seen");
                if (!seen) return "/ramadan-results";
                return "/dashboard";
              })()}
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
