import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useAuthStore } from './store/authStore';
import { getStoredUser, getMyProfile } from './services/authService';
import ramLoader from './assets/ramloader.json';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import CategoryCounter from './pages/CategoryCounter';
import RamadanSchedule from './pages/RamadanSchedule';
import CommunityProgress from './pages/CommunityProgress';
import SurahOfWeek from './pages/SurahOfWeek';
import Analytics from './pages/Analytics';
import AsmaAlHusna from './pages/AsmaAlHusna';
import FirstThreeNames from './pages/FirstThreeNames';
import Quiz from './pages/Quiz';
import RouteTracker from './components/RouteTracker';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div>
          <Lottie
            animationData={ramLoader}
            loop
            autoplay
            style={{ width: 250, height: 250 }}
            onError={(e) => console.error('Lottie error:', e)}
          />
        </div>
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
    const cachedPhotoURL = localStorage.getItem('photoURL') || undefined;

    // Token exists → set user immediately so ProtectedRoute allows access
    const base = {
      uid: storedUser.userId,
      email: '',
      displayName: storedUser.displayName || 'User',
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
            localStorage.setItem('photoURL', profile.photoURL);
            if (profile.photoURL !== cachedPhotoURL) {
              setUser({ ...base, photoURL: profile.photoURL });
            }
          }
        })
        .catch(() => {/* ignore */});
    }, 2000);

    return () => clearTimeout(timer);
  }, [setUser, setLoading]);

  return (
    <Router>
      <RouteTracker />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><CommunityProgress /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><RamadanSchedule /></ProtectedRoute>} />
        <Route path="/counter/:categoryId" element={<ProtectedRoute><CategoryCounter /></ProtectedRoute>} />
        <Route path="/names/:categoryId" element={<ProtectedRoute><FirstThreeNames /></ProtectedRoute>} />
        <Route path="/surah" element={<ProtectedRoute><SurahOfWeek /></ProtectedRoute>} />
        <Route path="/asma" element={<ProtectedRoute><AsmaAlHusna /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
