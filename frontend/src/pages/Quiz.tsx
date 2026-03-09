import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import {
  getAvailableAsmaNumbers,
  generateQuiz,
  saveQuizResult,
  type QuizQuestion,
  type QuizResult,
} from "../services/quizService";

export default function Quiz() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const initQuiz = async () => {
      try {
        const asmaNumbers = await getAvailableAsmaNumbers();
        if (asmaNumbers.length === 0) {
          setLoading(false);
          return;
        }

        const generatedQuestions = generateQuiz(asmaNumbers);
        setQuestions(generatedQuestions);
      } catch (error) {
        console.error("Қате пайда болды:", error);
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [user, navigate]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    if (!showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion.id]: answer,
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    let correctCount = 0;
    const answers = questions.map((q) => {
      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selected: selectedAnswers[q.id] || "",
        correct: q.correctAnswer,
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(correctCount);

    const result: QuizResult = {
      date: new Date().toISOString().split("T")[0],
      score: correctCount,
      total: questions.length,
      percentage,
      answers,
    };

    try {
      await saveQuizResult(result);
    } catch (error) {
      console.error("Нәтижені сақтау кезінде қате:", error);
    }

    setShowResults(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
        <div className="px-4 pt-6">
          <div className="h-6 w-20 bg-indigo-200 rounded animate-pulse mb-6" />
        </div>

        {/* Progress bar skeleton */}
        <div className="px-4 mb-6">
          <div className="flex justify-between mb-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-300 h-2 rounded-full w-1/4 animate-pulse" />
          </div>
        </div>

        {/* Question card skeleton */}
        <div className="px-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-6" />

            {/* Options skeleton */}
            <div className="space-y-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 w-full bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 h-12 bg-indigo-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
        <div className="px-4 pt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
          >
            <ChevronLeft size={20} />
            Артқа
          </button>
        </div>

        <div className="px-4 text-center mt-20">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Есімдер әлі жоқ
          </h2>
          <p className="text-gray-600 mb-6">
            Куизге өту үшін алдымен Алланың 99 есімін үйрену қажет
          </p>
          <button
            onClick={() => navigate("/asma")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Есімдерді үйрену →
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
        <div className="px-4 pt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
          >
            <ChevronLeft size={20} />
            Артқа
          </button>
        </div>

        <div className="px-4 py-8">
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">
              {score === questions.length ? "🎉" : score >= 7 ? "👏" : "💪"}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Куиз аяқталды!
            </h2>
            <div className="text-5xl font-bold text-indigo-600 my-4">
              {score}/{questions.length}
            </div>
            <p className="text-gray-600 text-lg mb-8">
              Нәтиже: {Math.round((score / questions.length) * 100)}%
            </p>

            <div className="space-y-2 mb-8">
              {questions.map((q, idx) => {
                const answer = selectedAnswers[q.id];
                const isCorrect = answer === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg text-left ${isCorrect ? "bg-green-50" : "bg-red-50"}`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2
                          size={20}
                          className="text-green-600 mt-1"
                        />
                      ) : (
                        <XCircle size={20} className="text-red-600 mt-1" />
                      )}
                      <div className="flex-1 text-sm">
                        <p className="font-semibold text-gray-900">
                          {idx + 1}.{" "}
                          {q.type === "name-to-meaning"
                            ? q.kazakhName
                            : q.meaning}
                        </p>
                        <p className="text-gray-600">
                          Таңдаған:{" "}
                          <span
                            className={
                              isCorrect
                                ? "text-green-600 font-semibold"
                                : "text-red-600"
                            }
                          >
                            {answer}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-gray-600">
                            Дұрыс жауап:{" "}
                            <span className="text-green-600 font-semibold">
                              {q.correctAnswer}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Қайта бастау
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
      <div className="px-4 pt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ChevronLeft size={20} />
          Артқа
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-900">
            Сұрақ {currentQuestionIndex + 1}/{questions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="px-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-2xl mb-4">
            {currentQuestion.type === "name-to-meaning" ? "📖" : "✨"}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {currentQuestion.type === "name-to-meaning"
              ? `"${currentQuestion.kazakhName}" дегеннің мағынасы қандай?`
              : `"${currentQuestion.meaning}" дегеннің есімі қандай?`}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option;
              const isCorrect = option === currentQuestion.correctAnswer;

              return (
                <button
                  key={option}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showResults}
                  className={`w-full p-4 rounded-lg text-left font-semibold transition-all ${
                    isSelected
                      ? isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : isCorrect && showResults
                        ? "bg-green-100 text-green-900 border-2 border-green-500"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 px-4 py-3 rounded-lg font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Артқа
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswers[currentQuestion.id]}
              className="flex-1 px-4 py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === questions.length - 1
                ? "Бітір"
                : "Алға →"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
