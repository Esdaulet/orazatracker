import { useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';

interface ToastProps {
  message: string;
  displayName: string;
  onClose: () => void;
  autoClose?: boolean;
}

export default function Toast({ message, displayName, onClose, autoClose = true }: ToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <UserPlus size={24} />
        </div>
        <div className="flex-1">
          <p className="font-bold">{message}</p>
          <p className="text-sm text-emerald-100 mt-1">{displayName}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-emerald-100 hover:text-white transition"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
