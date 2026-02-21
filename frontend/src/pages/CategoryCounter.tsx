import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getCategories } from "../services/categoryService";
import { getProgress, saveProgress } from "../services/progressService";
import { ArrowLeft, CheckCircle } from "lucide-react";
import type { Category } from "../types";

export default function CategoryCounter() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [category, setCategory] = useState<Category | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !categoryId) {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [user, categoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const categories = await getCategories();
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) {
        navigate("/dashboard");
        return;
      }
      setCategory(cat);

      const progress = await getProgress(today);
      const rawCount = progress[categoryId as string] || 0;
      const count = Array.isArray(rawCount) ? 0 : rawCount;
      setCount(count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSave = useCallback(
    (newCount: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (categoryId) {
            await saveProgress(today, categoryId, newCount);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    },
    [categoryId, today],
  );

  const handleIncrement = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    debouncedSave(newCount);
  }, [count, debouncedSave]);

  const isDone = category && count >= category.target;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col pb-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-4 pb-8">
          <div className="mb-4 w-8 h-8 bg-indigo-600 rounded animate-pulse" />
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-indigo-600 rounded animate-pulse" />
            <div className="h-8 w-12 bg-indigo-600 rounded animate-pulse" />
          </div>
        </div>

        {/* Counter Skeleton */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Big Counter */}
          <div className="w-56 h-56 rounded-3xl bg-gray-300 shadow-2xl flex items-center justify-center mb-8 animate-pulse" />

          {/* Progress Bar */}
          <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between text-sm mb-2">
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 animate-pulse" />
          </div>

          {/* Info Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full">
            <div className="h-4 w-full bg-gray-300 rounded mb-2 animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Категория табылмады</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 pt-4 pb-8 text-white">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 p-1 hover:bg-indigo-600 rounded transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-indigo-200 text-lg font-semibold">
            {category.target}
          </p>
        </div>
      </div>

      {/* Counter Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Big Counter */}
        <div
          onClick={handleIncrement}
          className="w-56 h-56 rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-2xl flex items-center justify-center cursor-pointer hover:shadow-xl transition-all mb-8 active:scale-95"
        >
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Есеп</p>
            <p className="text-7xl font-bold text-indigo-600">{count}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">
              {count} / {category.target}
            </span>
            <span className="text-gray-500">
              {Math.round((count / category.target) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${isDone ? "bg-green-500" : "bg-indigo-600"}`}
              style={{
                width: `${Math.min((count / category.target) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Completion Status */}
        {isDone && (
          <div className="text-center mb-8 flex items-center justify-center gap-2">
            <CheckCircle size={24} className="text-green-500" />
            <p className="text-green-600 font-bold text-lg">
              Тапсырма орындалды!
            </p>
          </div>
        )}

        {/* Meaning/Info */}
        {category.meaning && (
          <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm">
            <p className="text-gray-600 text-sm leading-relaxed text-center">
              {category.meaning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
