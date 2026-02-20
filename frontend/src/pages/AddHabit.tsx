import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addHabit } from '../services/habitService';
import BottomNav from '../components/BottomNav';

const categories = [
  { value: 'zikr', emoji: '📿', label: 'Зикры' },
  { value: 'quran', emoji: '📖', label: 'Коран' },
  { value: 'prayer', emoji: '🤲', label: 'Намаз' },
  { value: 'other', emoji: '✨', label: 'Другое' },
];

export default function AddHabit() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'zikr' | 'quran' | 'prayer' | 'other'>('zikr');
  const [target, setTarget] = useState('100');
  const [unit, setUnit] = useState('раз');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Введи название привычки'); return; }
    setLoading(true);
    try {
      await addHabit({ name, description, category, target: parseInt(target), unit });
      navigate('/dashboard');
    } catch {
      setError('Ошибка при добавлении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-700 px-4 pt-12 pb-6 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-white text-xl">←</button>
        <h1 className="text-white text-xl font-bold">Новая привычка</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 mt-4 flex flex-col gap-4">
        {/* Category picker */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-3">Категория</p>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value as any)}
                className={`flex flex-col items-center py-3 rounded-xl transition ${
                  category === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs mt-1 font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-gray-500 text-sm">Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 text-gray-900 text-lg font-medium outline-none"
            placeholder="Например: 100 зикров"
          />
        </div>

        {/* Target + Unit */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
          <div className="flex-1">
            <label className="text-gray-500 text-sm">Цель</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full mt-1 text-gray-900 text-lg font-medium outline-none"
              placeholder="100"
            />
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1">
            <label className="text-gray-500 text-sm">Единица</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full mt-1 text-gray-900 text-lg font-medium outline-none"
              placeholder="раз"
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-gray-500 text-sm">Заметка (опционально)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 text-gray-900 outline-none resize-none"
            placeholder="Добавь описание..."
            rows={2}
          />
        </div>

        {error && <p className="text-red-500 text-sm px-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-50"
        >
          {loading ? 'Добавляем...' : 'Добавить привычку'}
        </button>
      </form>

      <BottomNav />
    </div>
  );
}
