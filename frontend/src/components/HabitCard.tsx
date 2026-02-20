import { useState } from 'react';
import type { Habit, HabitLog } from '../types';
import { logHabit, deleteHabit } from '../services/habitService';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onRefresh: () => void;
}

const categoryEmoji: Record<string, string> = {
  zikr: '📿', quran: '📖', prayer: '🤲', other: '✨',
};

export default function HabitCard({ habit, log, onRefresh }: HabitCardProps) {
  const [completed, setCompleted] = useState(log?.completed || 0);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const progress = Math.min((completed / habit.target) * 100, 100);
  const isDone = completed >= habit.target;

  const update = async (newVal: number) => {
    if (loading) return;
    setLoading(true);
    try {
      await logHabit(habit.id, today, newVal);
      setCompleted(newVal);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить?')) return;
    try {
      await deleteHabit(habit.id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`rounded-2xl p-4 shadow-sm ${isDone ? 'bg-green-50 border border-green-200' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryEmoji[habit.category]}</span>
          <div>
            <h3 className="font-bold text-gray-900">{habit.name}</h3>
            {habit.description && <p className="text-gray-400 text-xs">{habit.description}</p>}
          </div>
        </div>
        <button onClick={handleDelete} className="text-gray-300 text-lg px-1">✕</button>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">{completed} / {habit.target} {habit.unit}</span>
          {isDone && <span className="text-green-600 font-bold">✓ Готово!</span>}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${isDone ? 'bg-green-500' : 'bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onPointerDown={() => !isDone && update(completed + 1)}
          disabled={isDone || loading}
          className={`flex-1 py-3 rounded-xl font-bold text-lg transition active:scale-95 ${
            isDone
              ? 'bg-green-100 text-green-500'
              : 'bg-indigo-600 text-white active:bg-indigo-700'
          } disabled:opacity-50`}
        >
          {isDone ? '✓' : '+'}
        </button>
        <button
          onPointerDown={() => completed > 0 && update(completed - 1)}
          disabled={completed === 0 || loading}
          className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold text-lg flex items-center justify-center active:scale-95 disabled:opacity-30"
        >
          −
        </button>
      </div>
    </div>
  );
}
