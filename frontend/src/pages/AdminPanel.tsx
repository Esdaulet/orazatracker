import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../services/categoryService';
import BottomNav from '../components/BottomNav';
import { Settings, X, Square, Edit, Trash2, BarChart3 } from 'lucide-react';
import type { Category } from '../types';

export default function AdminPanel() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    target: 100,
    meaning: '',
    order: 0,
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data.sort((a, b) => a.order - b.order));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.target < 1) {
      alert('Толы мәліметтер енгіз');
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, formData.name, formData.target, formData.meaning, formData.order);
      } else {
        await createCategory(formData.name, formData.target, formData.meaning, formData.order);
      }
      await loadCategories();
      resetForm();
    } catch (e) {
      console.error(e);
      alert('Қате орын алды');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Бұл категорияны өшіргіңіз келе ме?')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (e) {
      console.error(e);
      alert('Өшіре алмады');
    }
  };

  const handleEdit = (cat: Category) => {
    setFormData({
      name: cat.name,
      target: cat.target,
      meaning: cat.meaning || '',
      order: cat.order,
    });
    setEditingId(cat.id);
    setFormOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', target: 100, meaning: '', order: 0 });
    setEditingId(null);
    setFormOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-12 pb-8 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings size={32} />
          Админ Панель
        </h1>
        <p className="text-indigo-200">Категория басқару</p>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 space-y-2">
        <button
          onClick={() => navigate('/analytics')}
          className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 flex items-center justify-center gap-2"
        >
          <BarChart3 size={20} />
          Аналитика
        </button>
        <button
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl active:scale-95"
        >
          + Жаңа категория
        </button>
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Түзету' : 'Жаңа категория'}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Атауы</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Салауат"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Максималды сан</label>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сипаттамасы (міндетті емес)</label>
                <textarea
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  placeholder="Субхәәнааллааһи уэ бихәмдиh..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Реттік нөмері</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg active:scale-95"
              >
                {editingId ? 'Сақтау' : 'Құру'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="px-4 mt-6 flex flex-col gap-3 mb-32">
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm mt-4">
            <div className="flex justify-center mb-3">
              <Square size={48} className="text-gray-300" />
            </div>
            <p className="text-gray-700 font-medium">Категория жоқ</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-indigo-600 font-semibold">Максималды: {cat.target}</p>
                </div>
                <span className="text-gray-500 text-xs"># {cat.order}</span>
              </div>

              {cat.meaning && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{cat.meaning}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="flex-1 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Түзету
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="flex-1 py-2 bg-red-50 text-red-600 font-bold rounded-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Өшіру
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!formOpen && <BottomNav />}
    </div>
  );
}
