import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { trackPageView } from '../services/analyticsService';

export default function RouteTracker() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Only track if user is authenticated and not on login/register pages
    if (user && location.pathname !== '/login' && location.pathname !== '/register') {
      trackPageView(location.pathname);
    }
  }, [location.pathname, user]);

  return null; // This component doesn't render anything
}
