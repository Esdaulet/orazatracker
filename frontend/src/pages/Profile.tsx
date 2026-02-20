import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logoutUser } from '../services/authService';
import { uploadProfilePhoto } from '../services/photoService';
import BottomNav from '../components/BottomNav';
import { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

const RAMADAN_END = new Date(2026, 2, 20); // Mar 20, 2026

function getDaysLeft(): number {
  const now = new Date();
  const diff = Math.ceil((RAMADAN_END.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.photoURL) {
      setPhotoURL(user.photoURL);
    }
    setPageLoading(false);
  }, [user?.photoURL]);

  const handleLogout = () => {
    logoutUser();
    useAuthStore.setState({ user: null });
    navigate('/login');
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
      console.error('Фото жүктеу қатесі:', error);
      alert('Фото жүктеу сәтсіз болды');
    } finally {
      setUploading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-indigo-700 pt-12 pb-16 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-400 mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-32 bg-indigo-500 rounded mx-auto animate-pulse" />
        </div>
        <div className="px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <div className="h-3 w-20 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center py-3">
              <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <div className="h-3 w-28 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="flex justify-between items-center py-3">
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-14 w-full bg-red-50 rounded-2xl animate-pulse" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-indigo-700 pt-12 pb-16 px-4 text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full bg-indigo-400 flex items-center justify-center mx-auto text-3xl overflow-hidden">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-white rounded-full p-2 text-indigo-600 shadow-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Camera size={16} />
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
        {uploading && <p className="text-indigo-200 text-xs mt-1">Жүктелуде...</p>}
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h2 className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">Аккаунт</h2>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700">Аты</span>
            <span className="text-gray-900 font-medium">{user?.displayName}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-700">ID</span>
            <span className="text-gray-500 text-sm font-mono">{user?.uid?.slice(0, 12)}...</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h2 className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">Рамазан 2026</h2>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-700">🌙 Рамазан аяғына дейін</span>
            <span className="text-indigo-600 font-bold">{getDaysLeft()} күн</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl border border-red-100"
        >
          Аккаунттан шығу
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
