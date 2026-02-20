import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getAnalytics } from '../services/analyticsService';
import BottomNav from '../components/BottomNav';
import { ArrowLeft, Clock, User } from 'lucide-react';

interface AnalyticsView {
  userId: string;
  displayName: string;
  page: string;
  timestamp: number;
  createdAt: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('kk-KZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getPageName(page: string): string {
  const names: Record<string, string> = {
    '/dashboard': 'Дашборд',
    '/community': 'Топтың прогресі',
    '/admin': 'Админ панель',
    '/profile': 'Профиль',
    '/schedule': 'Ораза құтты',
    '/surah': 'Апталық Сүре',
  };

  // Handle dynamic routes
  if (page.startsWith('/counter/')) return 'Санағыш';

  return names[page] || page;
}

export default function Analytics() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [views, setViews] = useState<AnalyticsView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if admin
    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    loadAnalytics();
  }, [user, navigate, selectedDate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics(selectedDate);
      setViews(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Each view now represents one user's last action for the day
  const uniqueUsers = views.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-12 pb-8 text-white">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-indigo-200 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={20} />
          <span>Назад</span>
        </button>
        <h1 className="text-3xl font-bold mb-2">Аналитика</h1>
        <p className="text-indigo-200">Пайдаланушылардың қызметтілік</p>
      </div>

      <div className="px-4 mt-6">
        {/* Date selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Күнін таңдау
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Барлық қызметтілік</p>
            <p className="text-3xl font-bold text-indigo-600">{views.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Уникальды пайдаланушы</p>
            <p className="text-3xl font-bold text-emerald-600">{uniqueUsers}</p>
          </div>
        </div>

        {/* Views list */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : views.length === 0 ? (
            <div className="p-8 text-center">
              <Clock size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-700 font-medium">Нәтижелер жоқ</p>
              <p className="text-gray-400 text-sm mt-1">
                Осы күні активтілік жоқ
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {views.map((view, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 transition flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
                      <User size={20} className="text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {view.displayName}
                    </p>
                    <p className="text-sm text-gray-600">{getPageName(view.page)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(view.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
